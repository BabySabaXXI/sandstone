/**
 * Push Notification Service
 * =========================
 * Handles Web Push API integration for browser push notifications.
 * Supports service worker registration and push subscription management.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  type Notification,
  type PushSubscription,
  type DeviceInfo,
} from "./types";

// ============================================
// PUSH NOTIFICATION CONFIGURATION
// ============================================

interface PushConfig {
  vapidPublicKey: string;
  serviceWorkerPath: string;
  defaultIcon: string;
  defaultBadge: string;
}

const DEFAULT_CONFIG: PushConfig = {
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  serviceWorkerPath: "/sw.js",
  defaultIcon: "/icons/icon-192x192.png",
  defaultBadge: "/icons/badge-72x72.png",
};

// ============================================
// PUSH NOTIFICATION SERVICE
// ============================================

export class PushNotificationService {
  private config: PushConfig;
  private supabase: SupabaseClient<Database>;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor(config?: Partial<PushConfig>, supabaseClient?: SupabaseClient<Database>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.supabase = supabaseClient || this.createClient();
  }

  private createClient(): SupabaseClient<Database> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Supabase environment variables are not configured");
    }

    return createBrowserClient<Database>(url, key);
  }

  // ============================================
  // SERVICE WORKER REGISTRATION
  // ============================================

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && 
           "serviceWorker" in navigator && 
           "PushManager" in window;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return Notification.permission === "granted";
  }

  /**
   * Check if permission is denied
   */
  isPermissionDenied(): boolean {
    return Notification.permission === "denied";
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn("Push notifications not supported");
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register(
        this.config.serviceWorkerPath
      );
      console.log("Service Worker registered:", this.swRegistration);
      return this.swRegistration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Get existing service worker registration
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.swRegistration) {
      return this.swRegistration;
    }

    if (!this.isSupported()) {
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.getRegistration(
        this.config.serviceWorkerPath
      );
      return this.swRegistration;
    } catch (error) {
      console.error("Failed to get service worker registration:", error);
      return null;
    }
  }

  // ============================================
  // PERMISSION MANAGEMENT
  // ============================================

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Failed to request permission:", error);
      return "denied";
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // ============================================
  // PUSH SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Subscribe to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn("Push notifications not supported");
      return null;
    }

    // Check permission
    if (!this.isPermissionGranted()) {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }
    }

    // Get service worker registration
    let registration = await this.getRegistration();
    if (!registration) {
      registration = await this.registerServiceWorker();
    }

    if (!registration) {
      console.error("Service worker not available");
      return null;
    }

    try {
      // Get existing subscription
      let subscription = await registration.pushManager.getSubscription();

      // Unsubscribe if exists (to get fresh subscription)
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Subscribe with VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(
        this.config.vapidPublicKey
      );

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Save subscription to database
      const pushSubscription = await this.saveSubscription(userId, subscription);

      return pushSubscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await this.getRegistration();
      
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove from database
      await this.removeSubscription(userId);

      return true;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registration = await this.getRegistration();
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getPushSubscription(): Promise<globalThis.PushSubscription | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await this.getRegistration();
      if (!registration) {
        return null;
      }

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Failed to get push subscription:", error);
      return null;
    }
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  /**
   * Save push subscription to database
   */
  private async saveSubscription(
    userId: string,
    subscription: globalThis.PushSubscription
  ): Promise<PushSubscription | null> {
    try {
      const deviceInfo = this.getDeviceInfo();

      const { data, error } = await this.supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: this.arrayBufferToBase64(
              subscription.getKey("p256dh")!
            ),
            auth: this.arrayBufferToBase64(
              subscription.getKey("auth")!
            ),
            device_info: deviceInfo,
            is_active: true,
            last_used_at: new Date().toISOString(),
          },
          {
            onConflict: "endpoint",
          }
        )
        .select()
        .single();

      if (error) throw error;

      return data as PushSubscription;
    } catch (error) {
      console.error("Failed to save subscription:", error);
      return null;
    }
  }

  /**
   * Remove push subscription from database
   */
  private async removeSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.getPushSubscription();
      if (subscription) {
        await this.supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", userId)
          .eq("endpoint", subscription.endpoint);
      }
    } catch (error) {
      console.error("Failed to remove subscription:", error);
    }
  }

  /**
   * Get user's push subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const { data, error } = await this.supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;

      return data as PushSubscription[];
    } catch (error) {
      console.error("Failed to get user subscriptions:", error);
      return [];
    }
  }

  // ============================================
  // NOTIFICATION DISPLAY
  // ============================================

  /**
   * Show local notification
   */
  async showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<Notification | null> {
    if (!this.isSupported() || !this.isPermissionGranted()) {
      return null;
    }

    try {
      const registration = await this.getRegistration();
      
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, {
          icon: this.config.defaultIcon,
          badge: this.config.defaultBadge,
          ...options,
        });
      } else {
        // Fallback to standard Notification API
        return new window.Notification(title, {
          icon: this.config.defaultIcon,
          ...options,
        });
      }

      return null;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  }

  /**
   * Show notification from Sandstone notification object
   */
  async showNotification(notification: Notification): Promise<void> {
    const actions = notification.actions?.map((action) => ({
      action: action.id,
      title: action.label,
    }));

    await this.showLocalNotification(notification.title, {
      body: notification.message,
      icon: notification.icon || this.config.defaultIcon,
      badge: this.config.defaultBadge,
      image: notification.image_url,
      data: {
        notificationId: notification.id,
        link: notification.link,
        actions: notification.actions,
        ...notification.data,
      },
      actions,
      requireInteraction: notification.priority === "urgent",
      tag: notification.group_id || notification.id,
      renotify: !!notification.group_id,
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";
    
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    let platform: DeviceInfo["platform"] = "web";
    let browser = "unknown";
    let os = "unknown";

    // Detect platform
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      platform = "ios";
    } else if (/Android/.test(userAgent)) {
      platform = "android";
    }

    // Detect browser
    if (/Chrome/.test(userAgent)) {
      browser = "Chrome";
    } else if (/Firefox/.test(userAgent)) {
      browser = "Firefox";
    } else if (/Safari/.test(userAgent)) {
      browser = "Safari";
    } else if (/Edge/.test(userAgent)) {
      browser = "Edge";
    }

    // Detect OS
    if (/Windows/.test(userAgent)) {
      os = "Windows";
    } else if (/Mac/.test(userAgent)) {
      os = "macOS";
    } else if (/Linux/.test(userAgent)) {
      os = "Linux";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
    } else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) {
      os = "iOS";
    }

    return {
      device_id: this.generateDeviceId(),
      platform,
      browser,
      os,
      user_agent: userAgent,
    };
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let pushServiceInstance: PushNotificationService | null = null;

export function getPushNotificationService(
  config?: Partial<PushConfig>
): PushNotificationService {
  if (!pushServiceInstance || config) {
    pushServiceInstance = new PushNotificationService(config);
  }
  return pushServiceInstance;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export function isPushSupported(): boolean {
  const service = getPushNotificationService();
  return service.isSupported();
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  const service = getPushNotificationService();
  return service.requestPermission();
}

export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
  const service = getPushNotificationService();
  return service.subscribe(userId);
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  const service = getPushNotificationService();
  return service.unsubscribe(userId);
}

export async function isPushSubscribed(): Promise<boolean> {
  const service = getPushNotificationService();
  return service.isSubscribed();
}

export default PushNotificationService;

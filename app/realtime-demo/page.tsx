/**
 * Realtime Demo Page
 * ==================
 * Example page demonstrating all realtime features.
 */

"use client";

import React, { useState } from "react";
import { RealtimeProvider } from "@/lib/realtime/realtime-provider";
import { 
  GradingProgress, 
  FlashcardSession, 
  PresenceIndicator,
  OnlineUsersList,
  NotificationToast,
  NotificationBell 
} from "@/components/realtime";
import { 
  useEssayGradingRealtime,
  useFlashcardSessionRealtime,
  usePresence,
  useNotifications 
} from "@/lib/realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo examiners configuration
const DEMO_EXAMINERS = [
  { id: "examiner-1", name: "AO1 Knowledge & Understanding", color: "#3B82F6" },
  { id: "examiner-2", name: "AO2 Application", color: "#10B981" },
  { id: "examiner-3", name: "AO3 Analysis", color: "#F59E0B" },
  { id: "examiner-4", name: "AO4 Evaluation", color: "#EF4444" },
];

function GradingDemo() {
  const [essayId, setEssayId] = useState<string | undefined>();
  const [isGrading, setIsGrading] = useState(false);

  const startGrading = () => {
    const newEssayId = `essay-${Date.now()}`;
    setEssayId(newEssayId);
    setIsGrading(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Essay Grading Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isGrading ? (
          <Button onClick={startGrading}>Start Grading Demo</Button>
        ) : (
          <>
            <GradingProgress
              essayId={essayId}
              userId="demo-user"
              examiners={DEMO_EXAMINERS}
              onComplete={() => setIsGrading(false)}
              onError={(error) => console.error("Grading error:", error)}
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setIsGrading(false);
                setEssayId(undefined);
              }}
            >
              Reset
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FlashcardDemo() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showSession, setShowSession] = useState(false);

  const startSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setShowSession(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcard Study Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showSession ? (
          <Button onClick={startSession}>Start Study Session</Button>
        ) : (
          <>
            <FlashcardSession
              sessionId={sessionId}
              userId="demo-user"
              deckId="demo-deck"
              onSessionEnd={(stats) => {
                console.log("Session ended:", stats);
                setShowSession(false);
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSession(false);
                setSessionId(undefined);
              }}
            >
              Reset
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PresenceDemo() {
  const { onlineUsers, onlineCount } = usePresence({
    userId: "demo-user",
    email: "demo@example.com",
    fullName: "Demo User",
    enabled: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Presence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresenceIndicator
          userId="demo-user"
          email="demo@example.com"
          fullName="Demo User"
          showOnlineCount
        />
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Online Users ({onlineCount})
          </h4>
          <OnlineUsersList users={onlineUsers} maxDisplay={5} />
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsDemo() {
  const { sendNotification, notifications } = useNotifications({
    userId: "demo-user",
    enabled: true,
  });

  const sendTestNotification = (type: "info" | "success" | "warning" | "error") => {
    const titles = {
      info: "Information",
      success: "Success!",
      warning: "Warning",
      error: "Error Occurred",
    };

    const messages = {
      info: "This is an informational notification.",
      success: "Your action was completed successfully!",
      warning: "Please review your settings.",
      error: "Something went wrong. Please try again.",
    };

    sendNotification({
      userId: "demo-user",
      type,
      title: titles[type],
      message: messages[type],
      data: { demo: true, timestamp: Date.now() },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Notifications
          <NotificationBell userId="demo-user" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={() => sendTestNotification("info")}
            className="bg-blue-50 hover:bg-blue-100"
          >
            Info
          </Button>
          <Button 
            variant="outline" 
            onClick={() => sendTestNotification("success")}
            className="bg-green-50 hover:bg-green-100"
          >
            Success
          </Button>
          <Button 
            variant="outline" 
            onClick={() => sendTestNotification("warning")}
            className="bg-yellow-50 hover:bg-yellow-100"
          >
            Warning
          </Button>
          <Button 
            variant="outline" 
            onClick={() => sendTestNotification("error")}
            className="bg-red-50 hover:bg-red-100"
          >
            Error
          </Button>
        </div>

        {notifications.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Recent Notifications
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-2 rounded text-sm ${
                    notif.type === "info" ? "bg-blue-50 text-blue-800" :
                    notif.type === "success" ? "bg-green-50 text-green-800" :
                    notif.type === "warning" ? "bg-yellow-50 text-yellow-800" :
                    "bg-red-50 text-red-800"
                  }`}
                >
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-xs opacity-75">{notif.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RealtimeDemoPage() {
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <NotificationToast userId="demo-user" />
        
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Sandstone Realtime Features Demo
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GradingDemo />
            <FlashcardDemo />
            <PresenceDemo />
            <NotificationsDemo />
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium mt-4">1. Essay Grading Progress</h3>
              <p className="text-gray-600">
                The grading progress component shows real-time updates as AI examiners 
                grade essays. Each examiner&apos;s progress is tracked individually.
              </p>

              <h3 className="text-lg font-medium mt-4">2. Flashcard Study Sessions</h3>
              <p className="text-gray-600">
                Study sessions track your progress in real-time, including cards reviewed, 
                accuracy, and streaks. Sessions can be paused and resumed.
              </p>

              <h3 className="text-lg font-medium mt-4">3. User Presence</h3>
              <p className="text-gray-600">
                Presence detection shows which users are online, away, or offline. 
                Click on the status dot to change your status.
              </p>

              <h3 className="text-lg font-medium mt-4">4. Notifications</h3>
              <p className="text-gray-600">
                Real-time notifications appear as toast messages. Click the buttons 
                to send test notifications of different types.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}

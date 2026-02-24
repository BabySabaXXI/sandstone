"use client";

import React, { useState } from "react";
import { Bell, Mail, MessageSquare, Trophy, GraduationCap, BookOpen, Clock, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationChannel {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface NotificationType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export function NotificationPreferences() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "email",
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: <Mail className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: "push",
      label: "Push Notifications",
      description: "Receive push notifications in browser",
      icon: <Bell className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: "inApp",
      label: "In-App Notifications",
      description: "Show notifications within the app",
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: true,
    },
  ]);

  const [types, setTypes] = useState<NotificationType[]>([
    {
      id: "grading",
      label: "Essay Grading",
      description: "When your essay has been graded",
      icon: <GraduationCap className="w-5 h-5" />,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: "achievements",
      label: "Achievements",
      description: "When you earn a new badge or achievement",
      icon: <Trophy className="w-5 h-5" />,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: "studyReminders",
      label: "Study Reminders",
      description: "Daily study session reminders",
      icon: <Clock className="w-5 h-5" />,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: "flashcards",
      label: "Flashcard Reviews",
      description: "When flashcards are due for review",
      icon: <BookOpen className="w-5 h-5" />,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: "system",
      label: "System Updates",
      description: "Important system announcements",
      icon: <Settings className="w-5 h-5" />,
      email: true,
      push: false,
      inApp: true,
    },
  ]);

  const handleChannelToggle = (channelId: string) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId
          ? { ...channel, enabled: !channel.enabled }
          : channel
      )
    );
  };

  const handleTypeToggle = (typeId: string, field: keyof NotificationType) => {
    setTypes((prev) =>
      prev.map((type) =>
        type.id === typeId ? { ...type, [field]: !type[field] } : type
      )
    );
  };

  const handleSave = () => {
    console.log("Saving preferences:", { channels, types });
    alert("Preferences saved!");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
      </div>

      {/* Channels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {channel.icon}
                </div>
                <div>
                  <p className="font-medium">{channel.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={channel.enabled}
                onCheckedChange={() => handleChannelToggle(channel.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Types Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {types.map((type) => (
            <div key={type.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {type.icon}
                </div>
                <div>
                  <p className="font-medium">{type.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-11">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={type.email}
                    onCheckedChange={() => handleTypeToggle(type.id, "email")}
                    disabled={!channels.find((c) => c.id === "email")?.enabled}
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={type.push}
                    onCheckedChange={() => handleTypeToggle(type.id, "push")}
                    disabled={!channels.find((c) => c.id === "push")?.enabled}
                  />
                  <span className="text-sm">Push</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={type.inApp}
                    onCheckedChange={() => handleTypeToggle(type.id, "inApp")}
                    disabled={!channels.find((c) => c.id === "inApp")?.enabled}
                  />
                  <span className="text-sm">In-App</span>
                </label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

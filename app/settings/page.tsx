"use client";

import { motion } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { Settings, Bell, Shield, User, Palette } from "lucide-react";

const settingsSections = [
  {
    icon: User,
    title: "Account",
    description: "Manage your profile and preferences",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure email and push notifications",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize the look and feel",
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "Control your data and privacy settings",
  },
];

export default function SettingsPage() {
  return (
    <ThreePanel>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-6 h-6 text-[#E8D5C4]" />
            <h1 className="text-h1 text-[#2D2D2D]">Settings</h1>
          </div>
          <p className="text-[#5A5A5A]">Manage your account and preferences</p>
        </motion.div>

        {/* Settings List */}
        <div className="space-y-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5 hover:shadow-card-hover transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F0F0EC] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#5A5A5A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D]">{section.title}</h3>
                    <p className="text-sm text-[#5A5A5A]">{section.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-[#8A8A8A]"
        >
          <p>Sandstone v1.0.0</p>
          <p className="mt-1">Built with Next.js and AI</p>
        </motion.div>
      </div>
    </ThreePanel>
  );
}

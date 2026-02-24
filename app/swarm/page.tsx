"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Agent {
  id: number;
  name: string;
  squad: string;
  status: string;
  progress: number;
  task: string;
}

export default function SwarmDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents/status");
      const data = await res.json();
      setAgents(data.agents);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const getSquadColor = (squad: string) => {
    const colors: Record<string, string> = {
      Backend: "bg-blue-500",
      Frontend: "bg-green-500",
      "UI/UX": "bg-purple-500",
      Auth: "bg-orange-500",
      "Bug Fix": "bg-red-500",
      Features: "bg-cyan-500",
      Deploy: "bg-pink-500",
    };
    return colors[squad] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Initializing 100 Agents...</p>
        </div>
      </div>
    );
  }

  const running = agents.filter((a) => a.status === "running").length;
  const completed = agents.filter((a) => a.status === "completed").length;
  const avgProgress = Math.round(agents.reduce((acc, a) => acc + a.progress, 0) / agents.length);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🐝 Sandstone Swarm Dashboard</h1>
        <div className="flex gap-6 text-sm">
          <div className="bg-gray-900 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Total Agents:</span>
            <span className="text-white font-bold ml-2">{agents.length}</span>
          </div>
          <div className="bg-gray-900 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Running:</span>
            <span className="text-green-400 font-bold ml-2">{running}</span>
          </div>
          <div className="bg-gray-900 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Completed:</span>
            <span className="text-blue-400 font-bold ml-2">{completed}</span>
          </div>
          <div className="bg-gray-900 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Avg Progress:</span>
            <span className="text-yellow-400 font-bold ml-2">{avgProgress}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${avgProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: agent.id * 0.01 }}
            className={`relative p-2 rounded-lg border ${
              agent.status === "running"
                ? "border-gray-700 bg-gray-900"
                : "border-green-500 bg-green-900/20"
            }`}
          >
            {/* Status Indicator */}
            <div className="absolute top-1 right-1">
              {agent.status === "running" ? (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              )}
            </div>

            {/* Agent Number */}
            <div className="text-xs text-gray-500 mb-1">#{agent.id}</div>

            {/* Squad Badge */}
            <div className={`text-xs px-1.5 py-0.5 rounded ${getSquadColor(agent.squad)} text-white mb-1 truncate`}>
              {agent.squad}
            </div>

            {/* Agent Name */}
            <div className="text-xs font-medium truncate mb-1" title={agent.name}>
              {agent.name}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
              <motion.div
                className={`h-full rounded-full ${
                  agent.status === "completed" ? "bg-blue-400" : "bg-green-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Progress Text */}
            <div className="text-xs text-gray-400">{agent.progress}%</div>

            {/* Task */}
            <div className="text-xs text-gray-500 truncate mt-1" title={agent.task}>
              {agent.task}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span>Completed</span>
        </div>
        {Object.entries({
          Backend: "bg-blue-500",
          Frontend: "bg-green-500",
          "UI/UX": "bg-purple-500",
          Auth: "bg-orange-500",
          "Bug Fix": "bg-red-500",
          Features: "bg-cyan-500",
          Deploy: "bg-pink-500",
        }).map(([squad, color]) => (
          <div key={squad} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${color} rounded`}></div>
            <span>{squad}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

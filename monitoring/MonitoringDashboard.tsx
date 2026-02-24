// ============================================
// FILE: components/monitoring/MonitoringDashboard.tsx
// React component for the monitoring dashboard
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; responseTime: number };
    connectionPool: { status: string; usagePercent: number };
    auth: { status: string };
  };
}

interface DashboardData {
  overview?: {
    database_status: string;
    connection_usage: number;
    active_users_today: number;
    errors_last_hour: number;
  };
  realtime?: Array<{
    metric: string;
    value: any;
    timestamp: string;
  }>;
  errors?: {
    summary: {
      total_last_24h: number;
      critical: number;
      unresolved: number;
    };
  };
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard?section=all');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHealth();
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Database Monitoring</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm font-medium">
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Overall Health</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.status || 'unknown')}`}></div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${getStatusTextColor(health?.status || 'unknown')}`}>
            {health?.status?.toUpperCase() || 'UNKNOWN'}
          </p>
        </div>

        {/* Database */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Database</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.checks.database.status || 'unknown')}`}></div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${getStatusTextColor(health?.checks.database.status || 'unknown')}`}>
            {health?.checks.database.status?.toUpperCase() || 'UNKNOWN'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Response: {health?.checks.database.responseTime}ms
          </p>
        </div>

        {/* Connection Pool */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Connection Pool</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.checks.connectionPool.status || 'unknown')}`}></div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${getStatusTextColor(health?.checks.connectionPool.status || 'unknown')}`}>
            {health?.checks.connectionPool.usagePercent}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Usage</p>
        </div>
      </div>

      {/* Overview Stats */}
      {dashboardData?.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Active Users Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.overview.active_users_today}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Connection Usage</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.overview.connection_usage}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Errors (Last Hour)</p>
            <p className={`text-2xl font-bold ${dashboardData.overview.errors_last_hour > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {dashboardData.overview.errors_last_hour}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Database Status</p>
            <p className={`text-2xl font-bold capitalize ${getStatusTextColor(dashboardData.overview.database_status)}`}>
              {dashboardData.overview.database_status}
            </p>
          </div>
        </div>
      )}

      {/* Error Summary */}
      {dashboardData?.errors?.summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Summary (Last 24h)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">
                {dashboardData.errors.summary.total_last_24h}
              </p>
              <p className="text-sm text-gray-500">Total Errors</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">
                {dashboardData.errors.summary.critical}
              </p>
              <p className="text-sm text-red-500">Critical</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">
                {dashboardData.errors.summary.unresolved}
              </p>
              <p className="text-sm text-yellow-500">Unresolved</p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Metrics */}
      {dashboardData?.realtime && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Metrics</h3>
          <div className="space-y-4">
            {dashboardData.realtime.map((metric, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {metric.metric.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-900">
                  {typeof metric.value === 'object' 
                    ? JSON.stringify(metric.value) 
                    : metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setLoading(true);
            fetchHealth();
            fetchDashboardData();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';

/**
 * Department Analytics component
 */
export default function DepartmentAnalytics({ department }) {
  const { name, binding, aiInfo, operationalMode } = department;
  
  // Sample analytics data (would come from API in production)
  const analyticsData = {
    totalActions: 1247,
    successRate: 98.2,
    avgResponseTime: 45,
    activeAIs: 3,
    escalations: 12,
    blockedActions: 3
  };
  
  const weeklyTrend = [65, 72, 80, 68, 75, 82, 78];
  const maxTrend = Math.max(...weeklyTrend);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">{name} - Performance metrics and AI activity insights</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Total Actions</div>
          <div className="text-2xl font-bold text-white">{analyticsData.totalActions.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">{analyticsData.successRate}%</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Avg Response</div>
          <div className="text-2xl font-bold text-cyan-400">{analyticsData.avgResponseTime}ms</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Active AIs</div>
          <div className="text-2xl font-bold text-purple-400">{analyticsData.activeAIs}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Escalations</div>
          <div className="text-2xl font-bold text-yellow-400">{analyticsData.escalations}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500 mb-1">Blocked</div>
          <div className="text-2xl font-bold text-red-400">{analyticsData.blockedActions}</div>
        </div>
      </div>
      
      {/* Weekly Activity Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-500">📊</span>
          Weekly Activity Trend
        </h2>
        
        <div className="flex items-end gap-2 h-32">
          {weeklyTrend.map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-cyan-500/60 rounded-t transition-all hover:bg-cyan-500"
                style={{ height: `${(value / maxTrend) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Performance Breakdown */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-purple-500">🤖</span>
          AI Performance Breakdown
        </h2>
        
        <div className="space-y-4">
          {aiInfo?.primary && (
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-400">{aiInfo.primary.name}</div>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="w-16 text-right text-sm font-mono text-cyan-400">85%</div>
            </div>
          )}
          {aiInfo?.secondary && (
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-400">{aiInfo.secondary.name}</div>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="w-16 text-right text-sm font-mono text-purple-400">72%</div>
            </div>
          )}
          {aiInfo?.execution && aiInfo.execution.id !== aiInfo.primary?.id && aiInfo.execution.id !== aiInfo.secondary?.id && (
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-400">{aiInfo.execution.name}</div>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '91%' }} />
              </div>
              <div className="w-16 text-right text-sm font-mono text-green-400">91%</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Autonomy Usage */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-500">🔐</span>
          Autonomy Level Usage
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">78%</div>
            <div className="text-xs text-gray-400 mt-1">Auto-Approved</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">19%</div>
            <div className="text-xs text-gray-400 mt-1">Required Approval</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">3%</div>
            <div className="text-xs text-gray-400 mt-1">Blocked/Escalated</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-gray-800/50">
          <div className="text-xs text-gray-500">
            Current autonomy level: <span className={`font-bold ${
              binding?.autonomyLevel === 'FULL' ? 'text-green-400' :
              binding?.autonomyLevel === 'PARTIAL' ? 'text-yellow-400' : 'text-red-400'
            }`}>{binding?.autonomyLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

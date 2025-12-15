'use client';

import React, { useState, useEffect } from 'react';

/**
 * AI Activity Log component
 * Displays audit log entries for AI actions in the department
 */
export default function AIActivityLog({ department }) {
  const { name, id, binding, aiInfo } = department;
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Generate sample audit log entries for display
  useEffect(() => {
    const generateSampleLogs = () => {
      const actions = [
        'code:generate',
        'code:review',
        'page:create',
        'analysis:read',
        'escalation:request',
        'review:approve',
        'deploy:approve'
      ];
      
      const results = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILURE', 'SUCCESS', 'PENDING'];
      
      const aiIds = [binding?.primaryAI, binding?.secondaryAI, binding?.executionAI].filter(Boolean);
      
      const sampleLogs = Array.from({ length: 25 }, (_, i) => {
        const aiId = aiIds[Math.floor(Math.random() * aiIds.length)] || '006';
        const action = actions[Math.floor(Math.random() * actions.length)];
        const result = results[Math.floor(Math.random() * results.length)];
        const riskScore = Math.floor(Math.random() * 80) + (result === 'FAILURE' ? 20 : 0);
        
        const now = new Date();
        const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        return {
          id: `AUDIT-${Date.now()}-${i}`,
          timestamp: timestamp.toISOString(),
          action,
          actor: `AI:${aiId}`,
          target: id,
          result,
          riskScore,
          details: {
            aiName: aiInfo?.primary?.name || 'COPILOT',
            departmentId: id
          }
        };
      });
      
      return sampleLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };
    
    // Simulate loading
    setTimeout(() => {
      setLogs(generateSampleLogs());
      setLoading(false);
    }, 500);
  }, [id, binding, aiInfo]);
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.result === filter);
  
  const getActionIcon = (action) => {
    if (action.includes('code')) return '💻';
    if (action.includes('deploy')) return '🚀';
    if (action.includes('review')) return '📝';
    if (action.includes('escalation')) return '⬆️';
    if (action.includes('analysis')) return '🔍';
    if (action.includes('page')) return '📄';
    return '⚡';
  };
  
  const getResultColor = (result) => {
    switch (result) {
      case 'SUCCESS': return 'text-green-400 bg-green-500/20';
      case 'FAILURE': return 'text-red-400 bg-red-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };
  
  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };
  
  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Activity Log</h1>
          <p className="text-gray-400">{name} - Audit trail of all AI actions</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Results</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500">Total Entries</div>
          <div className="text-2xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500">Success</div>
          <div className="text-2xl font-bold text-green-400">
            {logs.filter(l => l.result === 'SUCCESS').length}
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-400">
            {logs.filter(l => l.result === 'FAILURE').length}
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase font-mono text-gray-500">Avg Risk Score</div>
          <div className={`text-2xl font-bold ${getRiskColor(logs.length ? logs.reduce((a, l) => a + l.riskScore, 0) / logs.length : 0)}`}>
            {logs.length ? Math.round(logs.reduce((a, l) => a + l.riskScore, 0) / logs.length) : 0}
          </div>
        </div>
      </div>
      
      {/* Log Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-cyan-500">📋</span>
            Activity Log
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            Loading audit logs...
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No log entries found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getActionIcon(log.action)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{log.action}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-mono ${getResultColor(log.result)}`}>
                            {log.result}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Actor: <span className="text-cyan-400">{log.actor}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{formatTimestamp(log.timestamp)}</div>
                      <div className={`text-xs font-mono ${getRiskColor(log.riskScore)}`}>
                        Risk: {log.riskScore}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Framework Info */}
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
        <div className="text-xs text-gray-500">
          Audit logs generated per <span className="text-cyan-400 font-mono">PEER_REVIEW_FRAMEWORK_V2</span> - 
          All AI actions must be auditable with timestamp, actor, target, and risk scoring.
        </div>
      </div>
    </div>
  );
}

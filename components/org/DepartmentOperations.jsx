'use client';

import React from 'react';

/**
 * Department Operations component
 */
export default function DepartmentOperations({ department }) {
  const { name, binding, aiInfo, operationalMode } = department;
  
  const modeDescriptions = {
    execution: 'Focused on task completion and delivery. AI systems operate with high autonomy for routine operations.',
    strategy: 'Focused on planning and decision-making. AI systems provide analysis and recommendations.',
    hybrid: 'Balanced approach combining execution and strategy. AI systems adapt based on task type.'
  };
  
  const autonomyActions = {
    FULL: [
      { action: 'Create', status: 'allowed', icon: '✅' },
      { action: 'Update', status: 'allowed', icon: '✅' },
      { action: 'Delete', status: 'allowed', icon: '✅' },
      { action: 'Deploy', status: 'allowed', icon: '✅' }
    ],
    PARTIAL: [
      { action: 'Create', status: 'allowed', icon: '✅' },
      { action: 'Update', status: 'allowed', icon: '✅' },
      { action: 'Delete', status: 'requires_approval', icon: '⚠️' },
      { action: 'Deploy', status: 'requires_approval', icon: '⚠️' }
    ],
    ASSIST_ONLY: [
      { action: 'Create', status: 'draft_only', icon: '📝' },
      { action: 'Update', status: 'draft_only', icon: '📝' },
      { action: 'Delete', status: 'blocked', icon: '❌' },
      { action: 'Deploy', status: 'blocked', icon: '❌' }
    ]
  };
  
  const actions = autonomyActions[binding?.autonomyLevel] || autonomyActions.PARTIAL;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Operations</h1>
        <p className="text-gray-400">{name} - Operational workflows and AI execution capabilities</p>
      </div>
      
      {/* Operational Mode */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-500">⚙️</span>
          Operational Mode: <span className="text-cyan-400 uppercase">{operationalMode}</span>
        </h2>
        <p className="text-gray-400">{modeDescriptions[operationalMode]}</p>
      </div>
      
      {/* AI Action Capabilities */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-500">🤖</span>
          AI Action Capabilities
          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 ml-2">
            Autonomy: {binding?.autonomyLevel}
          </span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map(({ action, status, icon }) => (
            <div key={action} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">{action}</span>
                <span className="text-2xl">{icon}</span>
              </div>
              <div className={`text-xs uppercase font-mono ${
                status === 'allowed' ? 'text-green-400' :
                status === 'requires_approval' ? 'text-yellow-400' :
                status === 'draft_only' ? 'text-blue-400' :
                'text-red-400'
              }`}>
                {status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active Workflows */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-yellow-500">📋</span>
          Active Workflows
        </h2>
        
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Standard Review Pipeline</div>
              <div className="text-sm text-gray-500">All changes reviewed by primary AI before execution</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono">ACTIVE</span>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Escalation Protocol</div>
              <div className="text-sm text-gray-500">
                Escalates to {aiInfo?.escalation?.name || 'JARVIS'} when {binding?.autonomyLevel === 'ASSIST_ONLY' ? 'any mutation' : 'critical actions'} requested
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono">ENABLED</span>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Audit Logging</div>
              <div className="text-sm text-gray-500">All AI actions logged with timestamp and risk score</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-mono">REQUIRED</span>
          </div>
        </div>
      </div>
      
      {/* Primary AI Info */}
      {aiInfo?.primary && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-500">🎯</span>
            Primary AI Operator
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-cyan-400">{aiInfo.primary.name.charAt(0)}</span>
            </div>
            <div>
              <div className="font-bold text-white text-lg">{aiInfo.primary.name}</div>
              <div className="text-sm text-gray-400">{aiInfo.primary.roleClass?.replace(/_/g, ' ')}</div>
              <div className="text-xs text-gray-500 font-mono mt-1">ID: {aiInfo.primary.id}</div>
            </div>
          </div>
          
          {aiInfo.primary.primaryFunctions && (
            <div className="mt-4">
              <div className="text-xs uppercase font-mono text-gray-500 mb-2">Primary Functions</div>
              <div className="flex flex-wrap gap-2">
                {aiInfo.primary.primaryFunctions.map((fn, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">{fn}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

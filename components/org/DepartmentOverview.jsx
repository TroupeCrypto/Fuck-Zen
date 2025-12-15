'use client';

import React from 'react';

/**
 * AI Badge component for displaying AI system info
 */
function AIBadge({ ai, role, className = '' }) {
  if (!ai) return null;
  
  const roleColors = {
    primary: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
    secondary: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    execution: 'bg-green-500/20 border-green-500/40 text-green-400',
    escalation: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
  };
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${roleColors[role] || 'bg-gray-500/20 border-gray-500/40 text-gray-400'} ${className}`}>
      <span className="text-xs uppercase font-mono opacity-60">{role}</span>
      <span className="font-bold">{ai.name}</span>
      <span className="text-xs opacity-60">ID:{ai.id}</span>
    </div>
  );
}

/**
 * Department Overview component
 */
export default function DepartmentOverview({ department }) {
  const { name, description, category, operationalMode, regulatoryStatus, division, binding, aiInfo, isSubDepartment, parentDepartment } = department;
  
  const autonomyColors = {
    FULL: 'text-green-400 bg-green-500/20',
    PARTIAL: 'text-yellow-400 bg-yellow-500/20',
    ASSIST_ONLY: 'text-red-400 bg-red-500/20'
  };
  
  const modeColors = {
    execution: 'text-blue-400',
    strategy: 'text-purple-400',
    hybrid: 'text-cyan-400'
  };
  
  const regColors = {
    standard: 'text-gray-400',
    regulated: 'text-yellow-400',
    'highly-regulated': 'text-red-400'
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isSubDepartment && (
              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-mono">SUB-DEPT</span>
            )}
            <span className={`text-xs px-2 py-1 rounded font-mono ${modeColors[operationalMode]}`}>
              {operationalMode?.toUpperCase()}
            </span>
            {regulatoryStatus && regulatoryStatus !== 'standard' && (
              <span className={`text-xs px-2 py-1 rounded bg-opacity-20 font-mono ${regColors[regulatoryStatus]}`}>
                {regulatoryStatus.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
          <p className="text-gray-400 max-w-2xl">{description}</p>
          {isSubDepartment && parentDepartment && (
            <p className="text-sm text-gray-500 mt-2">
              Parent: <span className="text-cyan-400">{parentDepartment.name}</span>
            </p>
          )}
        </div>
        
        {/* Autonomy Level Badge */}
        <div className={`px-4 py-2 rounded-lg ${autonomyColors[binding?.autonomyLevel] || 'bg-gray-500/20'}`}>
          <div className="text-xs uppercase font-mono opacity-60">Autonomy Level</div>
          <div className="font-bold">{binding?.autonomyLevel || 'N/A'}</div>
        </div>
      </div>
      
      {/* AI Ownership Panel */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-cyan-500">🤖</span>
          AI Ownership & Bindings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AIBadge ai={aiInfo?.primary} role="primary" />
          <AIBadge ai={aiInfo?.secondary} role="secondary" />
          <AIBadge ai={aiInfo?.execution} role="execution" />
          <AIBadge ai={aiInfo?.escalation} role="escalation" />
        </div>
        
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <div className="text-xs uppercase font-mono text-gray-500 mb-2">Page Binding Declaration</div>
          <code className="text-sm text-cyan-400 font-mono">
            {name} → Primary: {aiInfo?.primary?.name || 'N/A'} | Analytics: {aiInfo?.secondary?.name || 'N/A'} | Execution: {aiInfo?.execution?.name || 'N/A'} | Final Review: {aiInfo?.escalation?.name || 'JARVIS'}
          </code>
        </div>
      </div>
      
      {/* Division Info */}
      {division && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-500">🏢</span>
            Division Context
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs uppercase font-mono text-gray-500">Division</div>
              <div className="font-bold text-white">{division.name}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-mono text-gray-500">Operational Mode</div>
              <div className={`font-bold ${modeColors[division.operationalMode]}`}>{division.operationalMode}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-mono text-gray-500">Firewall Required</div>
              <div className={`font-bold ${division.requiresFirewall ? 'text-red-400' : 'text-green-400'}`}>
                {division.requiresFirewall ? 'YES' : 'NO'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-mono text-gray-500">Audit Log</div>
              <div className={`font-bold ${division.requiresAuditLog ? 'text-yellow-400' : 'text-gray-400'}`}>
                {division.requiresAuditLog ? 'REQUIRED' : 'OPTIONAL'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Badge */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Category:</span>
        <span className="px-3 py-1 rounded-full bg-gray-800 text-white font-medium">{category}</span>
      </div>
    </div>
  );
}

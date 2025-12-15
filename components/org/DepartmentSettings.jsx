'use client';

import React from 'react';

/**
 * Department Settings component
 */
export default function DepartmentSettings({ department }) {
  const { name, id, binding, aiInfo, division, operationalMode, regulatoryStatus, isSubDepartment, parentDepartment } = department;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">{name} - AI ownership configuration and department settings</p>
      </div>
      
      {/* Department Identity */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-500">🏷️</span>
          Department Identity
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Department ID</label>
            <div className="bg-gray-800 rounded-lg px-4 py-2 font-mono text-cyan-400">{id}</div>
          </div>
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Slug</label>
            <div className="bg-gray-800 rounded-lg px-4 py-2 font-mono text-gray-300">{department.slug || id}</div>
          </div>
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Division</label>
            <div className="bg-gray-800 rounded-lg px-4 py-2 text-white">{division?.name || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Type</label>
            <div className="bg-gray-800 rounded-lg px-4 py-2 text-white">
              {isSubDepartment ? 'Sub-Department' : 'Department'}
            </div>
          </div>
          {isSubDepartment && parentDepartment && (
            <div className="col-span-2">
              <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Parent Department</label>
              <div className="bg-gray-800 rounded-lg px-4 py-2 text-purple-400">{parentDepartment.name}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Operational Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-500">⚙️</span>
          Operational Settings
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Operational Mode</label>
            <div className={`bg-gray-800 rounded-lg px-4 py-2 font-bold ${
              operationalMode === 'execution' ? 'text-blue-400' :
              operationalMode === 'strategy' ? 'text-purple-400' : 'text-cyan-400'
            }`}>
              {operationalMode?.toUpperCase()}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Autonomy Level</label>
            <div className={`bg-gray-800 rounded-lg px-4 py-2 font-bold ${
              binding?.autonomyLevel === 'FULL' ? 'text-green-400' :
              binding?.autonomyLevel === 'PARTIAL' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {binding?.autonomyLevel || 'N/A'}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase font-mono text-gray-500 mb-1">Regulatory Status</label>
            <div className={`bg-gray-800 rounded-lg px-4 py-2 font-bold ${
              regulatoryStatus === 'highly-regulated' ? 'text-red-400' :
              regulatoryStatus === 'regulated' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {(regulatoryStatus || 'standard').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Ownership Configuration */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-cyan-500">🤖</span>
          AI Ownership Configuration
          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 ml-2">PEER_REVIEW_FRAMEWORK_V2</span>
        </h2>
        
        <div className="space-y-4">
          {/* Primary AI Owner */}
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono text-gray-500">Primary AI Owner</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {aiInfo?.primary?.name || 'Not Assigned'}
                  {aiInfo?.primary && <span className="text-xs text-gray-500">ID:{aiInfo.primary.id}</span>}
                </div>
                {aiInfo?.primary?.roleClass && (
                  <div className="text-sm text-gray-400">{aiInfo.primary.roleClass.replace(/_/g, ' ')}</div>
                )}
              </div>
              <div className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono">PRIMARY</div>
            </div>
          </div>
          
          {/* Secondary AI Support */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono text-gray-500">Secondary AI Support</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {aiInfo?.secondary?.name || 'Not Assigned'}
                  {aiInfo?.secondary && <span className="text-xs text-gray-500">ID:{aiInfo.secondary.id}</span>}
                </div>
                {aiInfo?.secondary?.roleClass && (
                  <div className="text-sm text-gray-400">{aiInfo.secondary.roleClass.replace(/_/g, ' ')}</div>
                )}
              </div>
              <div className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono">SECONDARY</div>
            </div>
          </div>
          
          {/* Execution AI */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono text-gray-500">Execution AI</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {aiInfo?.execution?.name || 'Not Assigned'}
                  {aiInfo?.execution && <span className="text-xs text-gray-500">ID:{aiInfo.execution.id}</span>}
                </div>
                {aiInfo?.execution?.roleClass && (
                  <div className="text-sm text-gray-400">{aiInfo.execution.roleClass.replace(/_/g, ' ')}</div>
                )}
              </div>
              <div className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-mono">EXECUTION</div>
            </div>
          </div>
          
          {/* Escalation Target */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono text-gray-500">Escalation Target</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {aiInfo?.escalation?.name || 'JARVIS'}
                  <span className="text-xs text-gray-500">ID:{aiInfo?.escalation?.id || '002'}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {aiInfo?.escalation?.roleClass?.replace(/_/g, ' ') || 'EXECUTIVE OPERATOR'}
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono">ESCALATION</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Binding Declaration */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-yellow-500">📋</span>
          Page & Department Binding Rule
        </h2>
        
        <div className="p-4 rounded-lg bg-gray-800/50 font-mono text-sm">
          <div className="text-gray-500 mb-2">// EVERY DEPARTMENT PAGE MUST DECLARE:</div>
          <div className="text-white">
            <span className="text-cyan-400">{name}</span> → {' '}
            <span className="text-gray-500">Primary:</span> <span className="text-cyan-400">{aiInfo?.primary?.name || 'N/A'}</span> | {' '}
            <span className="text-gray-500">Analytics:</span> <span className="text-purple-400">{aiInfo?.secondary?.name || 'N/A'}</span> | {' '}
            <span className="text-gray-500">Execution:</span> <span className="text-green-400">{aiInfo?.execution?.name || 'N/A'}</span> | {' '}
            <span className="text-gray-500">Final Review:</span> <span className="text-yellow-400">{aiInfo?.escalation?.name || 'JARVIS'}</span>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          This binding is enforced by middleware and recorded in all audit logs.
          Violations trigger automatic escalation per AI_HIERARCHY rules.
        </div>
      </div>
      
      {/* Division Flags */}
      {division && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-red-500">🔒</span>
            Division Security Flags
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${division.requiresFirewall ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-white">Firewall Required</span>
                <span className={division.requiresFirewall ? 'text-red-400' : 'text-gray-500'}>
                  {division.requiresFirewall ? '✓ YES' : '○ NO'}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${division.requiresAuditLog ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-white">Audit Log Required</span>
                <span className={division.requiresAuditLog ? 'text-yellow-400' : 'text-gray-500'}>
                  {division.requiresAuditLog ? '✓ YES' : '○ NO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

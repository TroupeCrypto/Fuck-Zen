'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { buildOrgTree, DIVISIONS, DEPARTMENTS, SUB_DEPARTMENTS } from '../../lib/registry/orgRegistry.js';
import { AI_SYSTEMS, getAISystem } from '../../lib/registry/aiSystems.js';

/**
 * Org Map Page - Visual organization + AI graph
 */
export default function OrgMapPage() {
  const [expandedDivisions, setExpandedDivisions] = useState(new Set(['technology', 'product-design']));
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [filterAI, setFilterAI] = useState('all');
  const [filterAutonomy, setFilterAutonomy] = useState('all');
  const [filterRegulated, setFilterRegulated] = useState('all');
  
  const orgTree = useMemo(() => buildOrgTree(), []);
  
  // Filter the tree based on selected filters
  const filteredTree = useMemo(() => {
    return orgTree.map(division => {
      const filteredDepts = division.departments.filter(dept => {
        // AI filter
        if (filterAI !== 'all') {
          const hasAI = dept.primaryAI === filterAI || 
                        dept.secondaryAI === filterAI || 
                        dept.executionAI === filterAI;
          if (!hasAI) return false;
        }
        
        // Autonomy filter
        if (filterAutonomy !== 'all' && dept.autonomyLevel !== filterAutonomy) {
          return false;
        }
        
        // Regulated filter
        if (filterRegulated === 'regulated' && !['regulated', 'highly-regulated'].includes(dept.regulatoryStatus || division.regulatoryStatus)) {
          return false;
        }
        if (filterRegulated === 'standard' && ['regulated', 'highly-regulated'].includes(dept.regulatoryStatus || division.regulatoryStatus)) {
          return false;
        }
        
        return true;
      }).map(dept => ({
        ...dept,
        subDepartments: dept.subDepartments.filter(sub => {
          if (filterAI !== 'all') {
            const hasAI = sub.primaryAI === filterAI || 
                          sub.secondaryAI === filterAI || 
                          sub.executionAI === filterAI;
            if (!hasAI) return false;
          }
          if (filterAutonomy !== 'all' && sub.autonomyLevel !== filterAutonomy) {
            return false;
          }
          return true;
        })
      }));
      
      return { ...division, departments: filteredDepts };
    }).filter(div => div.departments.length > 0 || filterAI === 'all' && filterAutonomy === 'all' && filterRegulated === 'all');
  }, [orgTree, filterAI, filterAutonomy, filterRegulated]);
  
  const toggleDivision = (id) => {
    setExpandedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const toggleDepartment = (id) => {
    setExpandedDepartments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const getAutonomyColor = (level) => {
    switch (level) {
      case 'FULL': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'PARTIAL': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'ASSIST_ONLY': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };
  
  const getModeColor = (mode) => {
    switch (mode) {
      case 'execution': return 'text-blue-400';
      case 'strategy': return 'text-purple-400';
      case 'hybrid': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };
  
  const getRegColor = (status) => {
    switch (status) {
      case 'highly-regulated': return 'bg-red-500/20 text-red-400';
      case 'regulated': return 'bg-yellow-500/20 text-yellow-400';
      default: return '';
    }
  };
  
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-cyan-500">🗺️</span> Organization Map
            </h1>
            <p className="text-gray-400">
              Visual hierarchy of divisions, departments, and AI ownership per PEER_REVIEW_FRAMEWORK_V2
            </p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            ← Back to War Room
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{DIVISIONS.length}</div>
            <div className="text-xs text-gray-500 uppercase font-mono">Divisions</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{DEPARTMENTS.length}</div>
            <div className="text-xs text-gray-500 uppercase font-mono">Departments</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{SUB_DEPARTMENTS.length}</div>
            <div className="text-xs text-gray-500 uppercase font-mono">Sub-Departments</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{Object.keys(AI_SYSTEMS).length}</div>
            <div className="text-xs text-gray-500 uppercase font-mono">AI Systems</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Filter by AI</label>
            <select 
              value={filterAI}
              onChange={(e) => setFilterAI(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All AI Systems</option>
              {Object.values(AI_SYSTEMS).map(ai => (
                <option key={ai.id} value={ai.id}>{ai.name} (ID:{ai.id})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Filter by Autonomy</label>
            <select 
              value={filterAutonomy}
              onChange={(e) => setFilterAutonomy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Levels</option>
              <option value="FULL">Full Autonomy</option>
              <option value="PARTIAL">Partial</option>
              <option value="ASSIST_ONLY">Assist Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Regulatory Status</label>
            <select 
              value={filterRegulated}
              onChange={(e) => setFilterRegulated(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All</option>
              <option value="regulated">Regulated Only</option>
              <option value="standard">Standard Only</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => { setFilterAI('all'); setFilterAutonomy('all'); setFilterRegulated('all'); }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </header>
      
      {/* Org Tree */}
      <div className="space-y-4">
        {filteredTree.map(division => (
          <div key={division.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            {/* Division Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleDivision(division.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`transform transition-transform ${expandedDivisions.has(division.id) ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{division.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded ${getModeColor(division.operationalMode)}`}>
                      {division.operationalMode}
                    </span>
                    {division.requiresFirewall && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">🔒 FIREWALL</span>
                    )}
                    {division.regulatoryStatus !== 'standard' && (
                      <span className={`text-xs px-2 py-0.5 rounded ${getRegColor(division.regulatoryStatus)}`}>
                        {division.regulatoryStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{division.description}</p>
                </div>
              </div>
              
              {/* Division AI Info */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Primary:</span>
                <span className="text-cyan-400 font-mono text-sm">{getAISystem(division.primaryAI)?.name}</span>
                <span className={`text-xs px-2 py-1 rounded border ${getAutonomyColor(division.autonomyLevel)}`}>
                  {division.autonomyLevel}
                </span>
              </div>
            </div>
            
            {/* Departments */}
            {expandedDivisions.has(division.id) && division.departments.length > 0 && (
              <div className="border-t border-gray-800">
                {division.departments.map(dept => (
                  <div key={dept.id} className="border-b border-gray-800/50 last:border-b-0">
                    {/* Department Row */}
                    <div 
                      className="flex items-center justify-between px-6 py-3 pl-12 hover:bg-gray-800/30 cursor-pointer transition-colors"
                      onClick={() => dept.subDepartments?.length > 0 && toggleDepartment(dept.id)}
                    >
                      <div className="flex items-center gap-3">
                        {dept.subDepartments?.length > 0 ? (
                          <span className={`transform transition-transform text-sm ${expandedDepartments.has(dept.id) ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">─</span>
                        )}
                        <Link 
                          href={`/org/${division.slug}/${dept.slug}/overview`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          <span className="font-medium text-white">{dept.name}</span>
                        </Link>
                        <span className="text-xs text-gray-600">{dept.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-600">AI:</span>
                          <span className="text-cyan-400 text-xs font-mono">{getAISystem(dept.primaryAI)?.name}</span>
                          <span className="text-gray-600">/</span>
                          <span className="text-purple-400 text-xs font-mono">{getAISystem(dept.secondaryAI)?.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getAutonomyColor(dept.autonomyLevel)}`}>
                          {dept.autonomyLevel}
                        </span>
                        <Link 
                          href={`/org/${division.slug}/${dept.slug}/overview`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                    
                    {/* Sub-Departments */}
                    {expandedDepartments.has(dept.id) && dept.subDepartments?.length > 0 && (
                      <div className="bg-gray-900/30">
                        {dept.subDepartments.map(subDept => (
                          <div 
                            key={subDept.id}
                            className="flex items-center justify-between px-6 py-2 pl-20 hover:bg-gray-800/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-700 text-xs">└─</span>
                              <Link 
                                href={`/org/${division.slug}/${dept.slug}/${subDept.slug}/overview`}
                                className="text-sm text-gray-300 hover:text-cyan-400 transition-colors"
                              >
                                {subDept.name}
                              </Link>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-cyan-400/60 text-xs font-mono">{getAISystem(subDept.primaryAI)?.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${getAutonomyColor(subDept.autonomyLevel)}`}>
                                {subDept.autonomyLevel?.replace('_', ' ')}
                              </span>
                              <Link 
                                href={`/org/${division.slug}/${dept.slug}/${subDept.slug}/overview`}
                                className="text-xs px-2 py-1 bg-gray-800/50 rounded hover:bg-gray-700 transition-colors"
                              >
                                View →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* AI Hierarchy Legend */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          <span className="text-yellow-500">📊</span> AI Hierarchy & Override Order
        </h2>
        
        <div className="flex flex-wrap gap-4">
          {[
            { rank: 1, name: 'JARVIS', authority: 'Final Authority', color: 'cyan' },
            { rank: 2, name: 'CLAUDE', authority: 'Architectural Veto', color: 'purple' },
            { rank: 3, name: 'ZEN', authority: 'Design & Frontend', color: 'green' },
            { rank: 4, name: 'GPT-CLASS', authority: 'Strategy/Finance', color: 'yellow' },
            { rank: 5, name: 'COPILOT', authority: 'Execution', color: 'blue' },
            { rank: 6, name: 'SPECIALISTS', authority: 'Analysis/Research', color: 'gray' }
          ].map(level => (
            <div 
              key={level.rank}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-${level.color}-500/10 border-${level.color}-500/30`}
            >
              <span className="text-xs font-mono text-gray-500">#{level.rank}</span>
              <span className={`font-bold text-${level.color}-400`}>{level.name}</span>
              <span className="text-xs text-gray-500">({level.authority})</span>
            </div>
          ))}
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          <strong className="text-yellow-400">RULE:</strong> No lower-tier AI may override a higher-tier decision.
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DIVISIONS, DEPARTMENTS, getDepartmentsByDivision } from '../lib/registry/orgRegistry.js';

interface SiteMenuProps {
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  color: string;
}

const MAIN_NAV: NavItem[] = [
  { 
    name: 'War Room', 
    href: '/', 
    icon: '⚔️', 
    description: 'Executive Command Center',
    color: 'cyan'
  },
  { 
    name: 'Org Map', 
    href: '/org-map', 
    icon: '🗺️', 
    description: 'Organization Hierarchy & AI Ownership',
    color: 'purple'
  },
  { 
    name: 'Plan', 
    href: '/plan', 
    icon: '📋', 
    description: 'Active Directives & Tracking',
    color: 'yellow'
  }
];

// Color utility functions for Tailwind CSS (avoid dynamic class generation)
const getNavItemHoverBorder = (color: string) => {
  const borderColors: Record<string, string> = {
    cyan: 'hover:border-cyan-500/30',
    purple: 'hover:border-purple-500/30',
    yellow: 'hover:border-yellow-500/30',
  };
  return borderColors[color] || 'hover:border-gray-500/30';
};

const getNavItemHoverText = (color: string) => {
  const textColors: Record<string, string> = {
    cyan: 'group-hover:text-cyan-400',
    purple: 'group-hover:text-purple-400',
    yellow: 'group-hover:text-yellow-400',
  };
  return textColors[color] || 'group-hover:text-gray-400';
};

const getDivisionDotColor = (color: string) => {
  const dotColors: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    gray: 'bg-gray-500',
  };
  return dotColors[color] || 'bg-gray-500';
};

const getDivisionBadgeClasses = (color: string) => {
  const badgeClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };
  return badgeClasses[color] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
};

export default function SiteMenu({ onClose }: SiteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter divisions and departments based on search
  const filteredDivisions = DIVISIONS.filter(div => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesDivision = div.name.toLowerCase().includes(query) || 
                            div.description.toLowerCase().includes(query);
    const depts = getDepartmentsByDivision(div.id);
    const matchesDepartment = depts.some(d => 
      d.name.toLowerCase().includes(query) || 
      d.description?.toLowerCase().includes(query)
    );
    return matchesDivision || matchesDepartment;
  });

  const getDivisionColor = (mode: string) => {
    switch (mode) {
      case 'execution': return 'blue';
      case 'strategy': return 'purple';
      case 'hybrid': return 'cyan';
      default: return 'gray';
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveSection(null);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Menu Toggle Button - Floating hamburger */}
      <button
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all duration-300 group"
        aria-label="Toggle menu"
      >
        <div className="flex flex-col gap-1.5 w-5">
          <span className={`h-0.5 bg-cyan-400 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-0.5 bg-cyan-400 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 bg-cyan-400 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </div>
      </button>

      {/* Keyboard shortcut indicator */}
      <div className="fixed top-4 left-16 z-40 hidden md:flex items-center gap-2 text-xs text-gray-600 font-mono">
        <span className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">⌘</span>
        <span className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">K</span>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-full max-w-md z-50 bg-[#0a0a0a] border-r border-gray-800 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                TROUPE <span className="text-cyan-500">NAV</span>
              </h2>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Site Navigation</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search divisions, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-180px)]">
          {/* Main Navigation */}
          <div className="p-4">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3 px-2">Main</h3>
            <nav className="space-y-1">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group border border-transparent ${getNavItemHoverBorder(item.color)}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-white ${getNavItemHoverText(item.color)} transition-colors`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </nav>
          </div>

          {/* Divisions Section */}
          <div className="p-4 border-t border-gray-800/50">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3 px-2">
              Divisions ({filteredDivisions.length})
            </h3>
            <div className="space-y-1">
              {filteredDivisions.map((division) => {
                const depts = getDepartmentsByDivision(division.id);
                const isActive = activeSection === division.id;
                const color = getDivisionColor(division.operationalMode);
                
                return (
                  <div key={division.id} className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => setActiveSection(isActive ? null : division.id)}
                      onMouseEnter={() => setHoveredDivision(division.id)}
                      onMouseLeave={() => setHoveredDivision(null)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 ${isActive ? 'bg-gray-800/70' : 'hover:bg-gray-800/30'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getDivisionDotColor(color)} ${isActive || hoveredDivision === division.id ? 'animate-pulse' : ''}`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-200 text-sm">{division.name}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${getDivisionBadgeClasses(color)}`}>
                        {depts.length}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Department Links */}
                    <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className="pl-6 pr-3 py-2 space-y-1 bg-gray-900/30">
                        {depts
                          .filter(dept => {
                            if (!searchQuery) return true;
                            return dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   dept.description?.toLowerCase().includes(searchQuery.toLowerCase());
                          })
                          .map((dept) => (
                            <Link
                              key={dept.id}
                              href={`/org/${division.slug}/${dept.slug}/overview`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors group"
                            >
                              <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-cyan-500 transition-colors"></span>
                              <span className="flex-1">{dept.name}</span>
                              <svg className="w-3 h-3 text-gray-700 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-mono">TROUPE.INC</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

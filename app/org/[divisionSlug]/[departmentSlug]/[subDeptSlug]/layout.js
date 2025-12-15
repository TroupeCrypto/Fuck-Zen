'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Shared layout for sub-department pages
 */
export default function SubDepartmentLayout({ children, params }) {
  const pathname = usePathname();
  const { divisionSlug, departmentSlug, subDeptSlug } = params;
  
  const basePath = `/org/${divisionSlug}/${departmentSlug}/${subDeptSlug}`;
  
  const navItems = [
    { name: 'Overview', path: `${basePath}/overview`, icon: '📊' },
    { name: 'Operations', path: `${basePath}/operations`, icon: '⚙️' },
    { name: 'Analytics', path: `${basePath}/analytics`, icon: '📈' },
    { name: 'AI Activity Log', path: `${basePath}/ai-activity-log`, icon: '🤖' },
    { name: 'Settings', path: `${basePath}/settings`, icon: '🔧' }
  ];
  
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      {/* Breadcrumb */}
      <div className="border-b border-gray-800 px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/org-map" className="text-cyan-500 hover:text-cyan-400">
            Org Map
          </Link>
          <span className="text-gray-600">/</span>
          <Link href={`/org/${divisionSlug}`} className="text-gray-400 hover:text-gray-300">
            {divisionSlug}
          </Link>
          <span className="text-gray-600">/</span>
          <Link href={`/org/${divisionSlug}/${departmentSlug}/overview`} className="text-gray-400 hover:text-gray-300">
            {departmentSlug}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">{subDeptSlug}</span>
        </nav>
      </div>
      
      {/* Sub Navigation */}
      <div className="border-b border-gray-800 px-6">
        <nav className="flex space-x-1">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive 
                    ? 'text-cyan-400 border-cyan-400' 
                    : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Page Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}

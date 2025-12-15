import React from 'react';
import { CorporateSection } from '../types';

interface FileViewerProps {
  sections: CorporateSection[];
}

const FileViewer: React.FC<FileViewerProps> = ({ sections }) => {
  return (
    <div className="border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-950 to-black rounded-xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200 block">Corporate Employee File: 001</span>
            <span className="text-[10px] text-slate-500 font-mono">(Final Approved State)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 px-2.5 py-1 border border-emerald-500/30 rounded-md bg-emerald-500/10 uppercase tracking-wider">
            Locked
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 overflow-x-auto max-h-[550px] overflow-y-auto">
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              {/* Section title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                <h4 className="text-cyan-400 font-mono text-sm font-semibold tracking-wide">
                  {section.title}
                </h4>
              </div>
              
              {/* Table */}
              <div className="rounded-lg border border-slate-800/80 overflow-hidden bg-black/30">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60">
                      {section.headers.map((h, i) => (
                        <th key={i} className="py-3 px-4 text-slate-400 font-mono uppercase text-[10px] tracking-[0.15em] font-medium border-b border-slate-800/80">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {section.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors group">
                        <td className="py-3 px-4 text-slate-200 font-medium align-top whitespace-nowrap">
                          <span className="group-hover:text-cyan-300 transition-colors">{row.col1}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 align-top leading-relaxed">{row.col2}</td>
                        {row.col3 && (
                          <td className="py-3 px-4 text-slate-600 text-xs font-mono align-top">{row.col3}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-mono">LAST_MODIFIED: 2024-12-15</span>
        <span className="text-[10px] text-slate-600 font-mono">CLASSIFICATION: TIER_1</span>
      </div>
    </div>
  );
};

export default FileViewer;
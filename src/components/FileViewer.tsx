import React from 'react';
import { CorporateSection } from '../types';

interface FileViewerProps {
  sections: CorporateSection[];
}

const FileViewer: React.FC<FileViewerProps> = ({ sections }) => {
  return (
    <div className="border border-gray-700 bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
           <span className="text-sm font-mono text-gray-300">Corporate Employee File: 001 (Final Approved State)</span>
        </div>
        <span className="text-xs font-mono text-green-500 px-2 py-0.5 border border-green-900 rounded bg-green-900/20">LOCKED</span>
      </div>
      
      <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-cyan-500 font-mono text-sm border-b border-cyan-900/50 pb-1 mb-3 inline-block">
                {section.title}
              </h4>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr>
                    {section.headers.map((h, i) => (
                      <th key={i} className="border-b border-gray-700 py-2 px-3 text-gray-400 font-mono uppercase text-xs tracking-wider bg-gray-900/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {section.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-900/40 transition-colors">
                      <td className="py-2 px-3 text-gray-300 font-semibold align-top whitespace-nowrap">{row.col1}</td>
                      <td className="py-2 px-3 text-gray-400 align-top">{row.col2}</td>
                      {row.col3 && <td className="py-2 px-3 text-gray-500 text-xs font-mono align-top">{row.col3}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
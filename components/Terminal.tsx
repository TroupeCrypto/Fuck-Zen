import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-72 bg-gradient-to-b from-slate-950 to-black border border-slate-800/80 rounded-xl overflow-hidden flex flex-col font-mono text-xs shadow-2xl shadow-black/50 relative">
      {/* Subtle scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
      }} />
      
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-slate-300 uppercase tracking-[0.2em] font-semibold text-[11px]">System Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">JARVIS_v2.4</span>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        </div>
      </div>
      
      {/* Log content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 relative">
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-600 animate-pulse">Awaiting system output...</span>
          </div>
        )}
        {logs.map((log, index) => (
          <div 
            key={log.id} 
            className="flex group hover:bg-slate-900/50 px-2 py-1 -mx-2 rounded transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-slate-600 mr-3 shrink-0 tabular-nums">[{log.timestamp}]</span>
            <span className={`leading-relaxed
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'warning' ? 'text-amber-400' : ''}
              ${log.type === 'success' ? 'text-emerald-400' : ''}
              ${log.type === 'info' ? 'text-cyan-300' : ''}
              ${log.type === 'system' ? 'text-purple-400' : ''}
            `}>
              {log.type === 'error' && <span className="mr-1">✗</span>}
              {log.type === 'success' && <span className="mr-1">✓</span>}
              {log.type === 'warning' && <span className="mr-1">⚠</span>}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};

export default Terminal;
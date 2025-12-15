import React from 'react';
import { Executive, ConnectionStatus } from '../types';

interface ExecutiveCardProps {
  data: Executive;
  onClick: (id: string) => void;
}

const ExecutiveCard: React.FC<ExecutiveCardProps> = ({ data, onClick }) => {
  const isOnline = data.status === ConnectionStatus.ACTIVE || data.status === ConnectionStatus.CONNECTED;
  const isPending = data.status === ConnectionStatus.PENDING;
  const isActive = data.status === ConnectionStatus.ACTIVE;

  return (
    <div 
      onClick={() => onClick(data.id)}
      className={`
        relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden group cursor-pointer
        ${isOnline 
          ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
          : 'border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-950/80 hover:border-slate-600/60'}
        ${isPending ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/80' : ''}
      `}
    >
      {/* Animated gradient overlay for active cards */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 animate-pulse pointer-events-none" />
      )}
      
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 pointer-events-none ${isOnline ? 'opacity-100' : 'opacity-30'}`}>
        <div className={`absolute top-0 right-0 w-[1px] h-8 ${isOnline ? 'bg-gradient-to-b from-cyan-400 to-transparent' : 'bg-gradient-to-b from-slate-600 to-transparent'}`} />
        <div className={`absolute top-0 right-0 h-[1px] w-8 ${isOnline ? 'bg-gradient-to-l from-cyan-400 to-transparent' : 'bg-gradient-to-l from-slate-600 to-transparent'}`} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {/* Status indicator dot */}
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
          <h3 className={`font-bold text-lg tracking-tight ${isOnline ? 'text-white' : 'text-slate-400'}`}>
            {data.name}
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded-md uppercase tracking-wider font-medium
          ${isActive ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30' : ''}
          ${isPending ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30' : ''}
          ${data.status === ConnectionStatus.CONNECTED ? 'text-green-400 bg-green-500/20 border border-green-500/30' : ''}
          ${data.status === ConnectionStatus.OFFLINE ? 'text-slate-500 bg-slate-800/50 border border-slate-700/50' : ''}
        `}>
          {data.status}
        </span>
      </div>
      
      {/* Info section */}
      <div className="space-y-2 mb-4">
        <p className="text-[11px] text-slate-500 font-mono tracking-widest">ID: {data.id}</p>
        <p className={`text-sm font-semibold ${isOnline ? 'text-slate-200' : 'text-slate-400'}`}>{data.role}</p>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{data.specialty}</p>
      </div>

      {/* Signal strength visualization */}
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500
              ${isOnline 
                ? i < 4 ? 'bg-cyan-500' : 'bg-cyan-500/50'
                : isPending 
                  ? i < 2 ? 'bg-amber-500/60' : 'bg-slate-800' 
                  : 'bg-slate-800'}
            `}
            style={{ 
              opacity: isOnline ? 1 - (i * 0.12) : isPending ? 1 - (i * 0.25) : 0.3,
              transform: `scaleY(${1 + (i * 0.2)})`
            }}
          />
        ))}
      </div>
      
      {/* Hover action prompt */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
          {isOnline ? 'NEURAL_LINK_STABLE' : 'AWAITING_SYNC'}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <span className="text-[10px] font-mono text-cyan-400">ACCESS</span>
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCard;
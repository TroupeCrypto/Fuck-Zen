import React from 'react';
import { Executive, ConnectionStatus } from '../types';

interface ExecutiveCardProps {
  data: Executive;
  onClick: (id: string) => void;
}

const ExecutiveCard: React.FC<ExecutiveCardProps> = ({ data, onClick }) => {
  const isOnline = data.status === ConnectionStatus.ACTIVE || data.status === ConnectionStatus.CONNECTED;
  const isPending = data.status === ConnectionStatus.PENDING;

  return (
    <div 
      onClick={() => onClick(data.id)}
      className={`
      relative p-4 rounded-sm border transition-all duration-500 overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-cyan-900/20
      ${isOnline ? 'border-cyan-500/50 bg-cyan-950/10 hover:bg-cyan-900/20' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800'}
      ${isPending ? 'animate-pulse border-yellow-900/50' : ''}
    `}>
      {/* Scanline effect */}
      {isOnline && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] w-full animate-scan pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-lg tracking-tight ${isOnline ? 'text-cyan-400' : 'text-gray-500'}`}>
          {data.name}
        </h3>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded
          ${isOnline ? 'text-cyan-400 border-cyan-500/50' : ''}
          ${isPending ? 'text-yellow-500 border-yellow-500/50' : ''}
          ${data.status === ConnectionStatus.OFFLINE ? 'text-red-900 border-red-900' : ''}
        `}>
          {data.status}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">ID: {data.id}</p>
        <p className="text-sm text-gray-300 font-semibold">{data.role}</p>
        <p className="text-xs text-gray-500 italic truncate">{data.specialty}</p>
      </div>

      {/* Connectivity Visualization */}
      <div className="mt-4 flex space-x-1 h-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-700
              ${isOnline ? 'bg-cyan-500' : 'bg-gray-800'}
            `}
            style={{ opacity: isOnline ? 1 - (i * 0.15) : 0.2 }}
          />
        ))}
      </div>
      
      {/* Hover prompt */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-cyan-400">
        ACCESS_TERMINAL &gt;
      </div>
    </div>
  );
};

export default ExecutiveCard;
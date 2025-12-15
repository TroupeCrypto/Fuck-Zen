import React, { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  active: boolean;
  size: number;
}

const StrategyMap: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    // Generate nodes with varying sizes
    const newNodes: Node[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      active: false,
      size: Math.random() > 0.7 ? 2 : 1.5
    }));
    setNodes(newNodes);

    // Randomly activate nodes
    const interval = setInterval(() => {
      setNodes(prev => {
        const updated = prev.map(n => 
          Math.random() > 0.92 ? { ...n, active: !n.active } : n
        );
        setConnectionCount(updated.filter(n => n.active).length);
        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-cyan-950/10 to-slate-950 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.08)] h-[550px] flex flex-col relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-cyan-950/40 px-5 py-3 border-b border-cyan-500/20 flex items-center justify-between z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full block animate-pulse"></span>
            <span className="absolute inset-0 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-50"></span>
          </div>
          <span className="text-sm font-mono text-cyan-300 font-semibold tracking-wide">GLOBAL_OPERATIONS_MAP</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-cyan-500/70 px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20">
            LIVE_FEED
          </span>
        </div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />

      {/* Map Content */}
      <div className="relative flex-1 p-4">
        {/* Orbital rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/20 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-cyan-500/30 rounded-full border-dashed animate-spin-slow [animation-direction:reverse]" />
        
        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.8),0_0_60px_rgba(6,182,212,0.4)]" />
          <div className="absolute inset-0 w-6 h-6 bg-cyan-400 rounded-full animate-ping opacity-30" />
        </div>

        {/* Nodes */}
        {nodes.map(node => (
          <div 
            key={node.id}
            className="absolute transition-all duration-700"
            style={{ top: `${node.y}%`, left: `${node.x}%` }}
          >
            {/* Connection line visual effect (CSS-based) */}
            {node.active && (
              <div 
                className="absolute w-px bg-gradient-to-b from-cyan-400/40 to-transparent pointer-events-none"
                style={{ 
                  height: '200px',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'top center'
                }}
              />
            )}
            
            {/* Node dot */}
            <div 
              className={`rounded-full transition-all duration-500 ${node.active 
                ? 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]' 
                : 'bg-slate-700'}`}
              style={{ width: `${node.size * 4}px`, height: `${node.size * 4}px` }}
            />
            
            {/* Ping effect for active nodes */}
            {node.active && (
              <div 
                className="absolute rounded-full border border-cyan-400/50 animate-ping"
                style={{ 
                  width: `${node.size * 12}px`, 
                  height: `${node.size * 12}px`,
                  top: `${-(node.size * 4)}px`,
                  left: `${-(node.size * 4)}px`
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="p-3 bg-black/70 backdrop-blur-sm border border-slate-800/80 rounded-lg font-mono text-[10px] text-slate-400 space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">NODES_ACTIVE</span>
            <span className="text-cyan-400 tabular-nums">{connectionCount}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">BANDWIDTH</span>
            <span className="text-emerald-400 tabular-nums">{Math.floor(Math.random() * 500 + 500)} TB/s</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">STATUS</span>
            <span className="text-cyan-400">OPERATIONAL</span>
          </div>
        </div>
        
        <div className="p-2 bg-black/70 backdrop-blur-sm border border-slate-800/80 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400">SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyMap;
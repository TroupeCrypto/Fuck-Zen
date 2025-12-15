import React, { useEffect, useState } from 'react';

type NodePoint = { id: number; x: number; y: number; active: boolean };

const StrategyMap: React.FC = () => {
  const [nodes, setNodes] = useState<NodePoint[]>([]);

  useEffect(() => {
    const newNodes = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      active: false
    }));
    setNodes(newNodes);

    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(n => (Math.random() > 0.9 ? { ...n, active: true } : n))
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-cyan-900/50 bg-black rounded-lg overflow-hidden shadow-[0_0_30px_rgba(8,145,178,0.1)] h-[600px] flex flex-col relative">
      <div className="bg-cyan-950/20 px-4 py-2 border-b border-cyan-900/50 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-mono text-cyan-400 font-bold">GLOBAL_OPERATIONS_MAP</span>
        </div>
        <span className="text-xs font-mono text-cyan-600">LIVE_FEED</span>
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative flex-1 p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full flex items-center justify-center animate-spin-slow">
          <div className="w-24 h-24 border border-cyan-500/50 rounded-full border-dashed"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,1)]"></div>

        {nodes.map(node => (
          <div
            key={node.id}
            style={{ top: `${node.y}%`, left: `${node.x}%` }}
            className={`absolute w-1.5 h-1.5 rounded-full ${node.active ? 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-cyan-900/70'}`}
          >
            {node.active && <span className="absolute inset-0 rounded-full bg-cyan-400/50 animate-ping"></span>}
          </div>
        ))}

        <div className="absolute inset-4 border border-cyan-900/40 rounded-xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default StrategyMap;

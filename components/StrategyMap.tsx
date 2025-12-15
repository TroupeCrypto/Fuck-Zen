import React, { useEffect, useState } from 'react';

const StrategyMap: React.FC = () => {
  const [nodes, setNodes] = useState<{id: number, x: number, y: number, active: boolean}[]>([]);

  useEffect(() => {
    // Generate static nodes
    const newNodes = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      active: false
    }));
    setNodes(newNodes);

    // Randomly activate nodes
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => 
        Math.random() > 0.9 ? { ...n, active: true } : n
      ));
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

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Map Content */}
      <div className="relative flex-1 p-4">
        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-24 h-24 border border-cyan-500/50 rounded-full border-dashed"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,1)]"></div>

        {/* Nodes */}
        {nodes.map(node => (
          <div 
            key={node.id}
            className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-1000
              ${node.active ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gray-800'}
            `}
            style={{ top: `${node.y}%`, left: `${node.x}%` }}
          >
            {node.active && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/20 rounded-full animate-ping"></div>
            )}
            {/* Connecting line to center (fake) */}
            {node.active && (
                <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none opacity-20">
                    <line x1="0" y1="0" x2={`${50 - node.x}vw`} y2={`${50 - node.y}vh`} stroke="#06b6d4" strokeWidth="1" />
                </svg>
            )}
          </div>
        ))}
      </div>
      
      {/* Overlay Data */}
      <div className="absolute bottom-4 left-4 p-2 bg-black/80 border border-gray-800 rounded font-mono text-[10px] text-gray-400">
        <p>NODES_ACTIVE: {nodes.filter(n => n.active).length}</p>
        <p>BANDWIDTH: {Math.floor(Math.random() * 1000)} TB/s</p>
        <p>TARGETS: ACQUIRED</p>
      </div>
    </div>
  );
};

export default StrategyMap;
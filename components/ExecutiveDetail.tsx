import React, { useState, useEffect, useRef } from 'react';
import { Executive, ConnectionStatus, Task } from '../types';
import { SYSTEM_THOUGHTS } from '../constants';

interface ExecutiveDetailProps {
  executive: Executive;
  tasks: Task[];
  onAddTask: (desc: string, priority: 'high' | 'medium' | 'low') => void;
  onCompleteTask?: (taskId: string) => void;
  onBack: () => void;
}

const ExecutiveDetail: React.FC<ExecutiveDetailProps> = ({ executive, tasks, onAddTask, onCompleteTask, onBack }) => {
  const isOnline = executive.status === ConnectionStatus.ACTIVE || executive.status === ConnectionStatus.CONNECTED;
  const [internalLogs, setInternalLogs] = useState<string[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulated Telemetry
  const [latency, setLatency] = useState(12);
  const [cpuLoad, setCpuLoad] = useState(34);

  // Generate "Live" thinking logs
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const randomThought = SYSTEM_THOUGHTS[Math.floor(Math.random() * SYSTEM_THOUGHTS.length)];
            const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setInternalLogs(prev => [...prev.slice(-15), `[${time}] ${randomThought}`]); // Keep last 15
        }
        // Jiggle telemetry
        setLatency(prev => Math.max(2, Math.min(50, prev + (Math.random() * 10 - 5))));
        setCpuLoad(prev => Math.max(10, Math.min(99, prev + (Math.random() * 20 - 10))));
    }, 1500);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [internalLogs]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    onAddTask(newTaskInput.trim(), newPriority);
    setNewTaskInput('');
    setNewPriority('medium');
  };

  const handleCompleteClick = (taskId: string) => {
    if (!onCompleteTask) return;
    
    // Trigger animation
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    // Actually complete after animation
    setTimeout(() => {
        onCompleteTask(taskId);
        // We don't remove from set because the task will likely move to 'completed' list or disappear, handled by parent state
    }, 800);
  };

  // Sort tasks: High -> Medium -> Low, then by time
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
      // Completed tasks at bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Then Priority
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then ID (Time)
      return b.id.localeCompare(a.id);
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      {/* Navigation Header */}
      <div className="flex items-center space-x-4 border-b border-gray-800 pb-4 justify-between">
        <div className="flex items-center space-x-4">
            <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-cyan-500 hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-cyan-900/50 rounded bg-cyan-950/30 hover:bg-cyan-900/50"
            >
            <span>&lt; Return to War Room</span>
            </button>
            <div className="h-4 w-px bg-gray-800"></div>
            <span className="text-gray-500 font-mono text-xs">SYSTEM_ID: {executive.id}</span>
            <div className="h-4 w-px bg-gray-800"></div>
            <span className="text-gray-500 font-mono text-xs">ACCESS_LEVEL: TIER_1</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Latency</p>
                <p className="text-xs font-mono text-cyan-500">{Math.floor(latency)}ms</p>
            </div>
            <div className="w-px h-6 bg-gray-800"></div>
            <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Load</p>
                <p className="text-xs font-mono text-purple-500">{Math.floor(cpuLoad)}%</p>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Identity & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-gray-800 bg-black/50 p-6 rounded-lg relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${isOnline ? 'bg-cyan-500' : 'bg-gray-700'}`}></div>
            <h1 className="text-3xl font-black text-white mb-2">{executive.name}</h1>
            <p className="text-sm font-mono text-cyan-500 mb-6">{executive.role}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">Status</label>
                <div className={`inline-flex items-center px-2 py-1 rounded border ${isOnline ? 'border-green-900 bg-green-900/20 text-green-400' : 'border-yellow-900 bg-yellow-900/20 text-yellow-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-bold">{executive.status}</span>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">Primary Function</label>
                <p className="text-gray-300 text-sm">{executive.specialty}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">Uptime</label>
                <p className="font-mono text-cyan-400">00:00:00:00</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-800 bg-gray-900/20 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Resource Allocation</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Neural Compute</span>
                  <span className="text-cyan-500">{isOnline ? 'Allocated' : 'Waiting'}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 transition-all duration-1000" style={{ width: isOnline ? `${cpuLoad}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Context Window</span>
                  <span className="text-purple-500">{isOnline ? '2048 / 128k' : 'Empty'}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Workspace / Terminal */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Active Context / Thinking Stream */}
          <div className="flex-1 border border-gray-800 bg-black rounded-lg overflow-hidden flex flex-col min-h-[300px]">
             <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300 uppercase">Live Neural Stream</span>
                <span className="text-[10px] font-mono text-gray-600">ID: {executive.id}_STREAM</span>
             </div>
             <div className="p-4 flex-1 font-mono text-xs overflow-y-auto" ref={logContainerRef}>
                {isOnline ? (
                    internalLogs.length > 0 ? (
                        internalLogs.map((log, i) => (
                            <div key={i} className="mb-1 text-cyan-900/70 border-l-2 border-cyan-900/30 pl-2">
                                <span className="text-cyan-400">{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-700 animate-pulse">
                            Initializing stream...
                        </div>
                    )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-yellow-600 font-mono text-sm">Connection Pending Initialization...</p>
                  </div>
                )}
             </div>
          </div>

          {/* Task Queue */}
          <div className="h-1/3 border border-gray-800 bg-gray-900/10 rounded-lg p-4 flex flex-col">
             <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Directives</h3>
                 <span className="text-[10px] text-gray-600">{tasks.filter(t => t.status !== 'completed').length} PENDING</span>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => {
                        const isCompleting = completingTasks.has(task.id);
                        const isCompleted = task.status === 'completed';
                        
                        let borderColor = 'border-gray-700';
                        let textColor = 'text-gray-200';
                        let priorityColor = 'text-gray-500 border-gray-600';
                        let priorityIcon = null;
                        
                        if (task.priority === 'high') {
                            borderColor = 'border-red-900/50 hover:border-red-500/50 border-l-4 border-l-red-600';
                            priorityColor = 'text-red-500 border-red-900';
                            priorityIcon = (
                                <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            );
                        } else if (task.priority === 'medium') {
                            borderColor = 'border-cyan-900/50 hover:border-cyan-500/50 border-l-4 border-l-cyan-600';
                            priorityColor = 'text-cyan-500 border-cyan-900';
                            priorityIcon = (
                                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            );
                        } else {
                             // Low
                             borderColor = 'border-gray-700 hover:border-gray-500 border-l-4 border-l-gray-500';
                             priorityIcon = (
                                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            );
                        }
                        
                        if (isCompleted) {
                            borderColor = 'border-green-500/30 bg-green-900/10 border-l-4 border-l-green-500';
                            textColor = 'text-green-400 line-through';
                            priorityIcon = null; // Remove priority icon on complete
                        }

                        return (
                            <div 
                                key={task.id} 
                                className={`
                                    p-3 border bg-gray-900/40 rounded flex justify-between items-center group transition-all duration-500
                                    ${borderColor}
                                    ${isCompleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                                `}
                            >
                               <div className="flex items-center">
                                    <button 
                                        onClick={() => !isCompleted && handleCompleteClick(task.id)}
                                        disabled={isCompleted}
                                        className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors shrink-0
                                            ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'}
                                        `}
                                    >
                                        {isCompleted && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                    <div>
                                        <p className={`text-sm ${textColor}`}>{task.description}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{task.timestamp}</p>
                                    </div>
                               </div>
                               <div className="flex flex-col items-end gap-1 ml-2">
                                    <div className="flex items-center gap-1">
                                        {priorityIcon}
                                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${priorityColor}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                               </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-4 border border-dashed border-gray-800 rounded bg-gray-900/20 text-xs text-gray-500 font-mono text-center">
                        No active directives. Awaiting input.
                    </div>
                )}
             </div>

             {/* Quick Add Task */}
             <form onSubmit={handleManualAdd} className="flex gap-2 mt-auto pt-2 border-t border-gray-800">
                <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="bg-black border border-gray-800 rounded px-2 py-2 text-xs text-gray-400 font-mono focus:border-cyan-500 focus:outline-none uppercase"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input 
                    type="text" 
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Dispatch new directive..."
                    className="flex-1 bg-black border border-gray-800 rounded px-3 py-2 text-xs text-gray-300 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <button 
                    type="submit"
                    className="px-3 py-2 bg-gray-800 hover:bg-cyan-900/30 text-gray-400 hover:text-cyan-400 border border-gray-700 hover:border-cyan-500 rounded text-xs font-bold uppercase transition-all"
                >
                    Assign
                </button>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExecutiveDetail;
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
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-5">
        <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all font-mono text-xs uppercase tracking-wider px-4 py-2.5 border border-cyan-500/30 rounded-lg bg-gradient-to-r from-cyan-950/40 to-slate-900/40 hover:from-cyan-900/40 hover:to-slate-800/40 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return to War Room</span>
            </button>
            <div className="h-6 w-px bg-slate-700/50"></div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-[11px] bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800/50">
                SYSTEM_ID: {executive.id}
              </span>
              <span className="text-slate-500 font-mono text-[11px] bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800/50">
                ACCESS_LEVEL: TIER_1
              </span>
            </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
            <div className="text-right bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Latency</p>
                <p className="text-sm font-mono text-cyan-400 font-semibold">{Math.floor(latency)}ms</p>
            </div>
            <div className="text-right bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Load</p>
                <p className="text-sm font-mono text-purple-400 font-semibold">{Math.floor(cpuLoad)}%</p>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Identity & Status */}
        <div className="lg:col-span-1 space-y-5">
          {/* Identity Card */}
          <div className="border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-xl relative overflow-hidden backdrop-blur-sm">
            {/* Accent line */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-full ${isOnline ? 'bg-gradient-to-b from-cyan-400 to-cyan-600' : 'bg-slate-700'}`}></div>
            
            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${isOnline ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{executive.status}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black ${isOnline ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-500'}`}>
                {executive.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-1">{executive.name}</h1>
                <p className="text-sm font-mono text-cyan-400">{executive.role}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <div>
                <label className="text-[10px] uppercase text-slate-500 tracking-wider block mb-1.5">Primary Function</label>
                <p className="text-slate-300 text-sm leading-relaxed">{executive.specialty}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 tracking-wider block mb-1.5">Uptime</label>
                <p className="font-mono text-cyan-400 text-lg">00:00:00:00</p>
              </div>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-5 rounded-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Resource Allocation
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Neural Compute</span>
                  <span className="text-cyan-400 font-mono">{isOnline ? 'Allocated' : 'Waiting'}</span>
                </div>
                <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000 rounded-full" style={{ width: isOnline ? `${cpuLoad}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Context Window</span>
                  <span className="text-purple-400 font-mono">{isOnline ? '2048 / 128k' : 'Empty'}</span>
                </div>
                <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 w-[10%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Workspace / Terminal */}
        <div className="lg:col-span-2 flex flex-col space-y-5">
          
          {/* Active Context / Thinking Stream */}
          <div className="flex-1 border border-slate-700/50 bg-gradient-to-br from-slate-950 to-black rounded-xl overflow-hidden flex flex-col min-h-[300px]">
             <div className="bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 px-5 py-3 border-b border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  <span className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Live Neural Stream</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800/50">ID: {executive.id}_STREAM</span>
             </div>
             <div className="p-4 flex-1 font-mono text-xs overflow-y-auto relative" ref={logContainerRef}>
                {isOnline ? (
                    internalLogs.length > 0 ? (
                        internalLogs.map((log, i) => (
                            <div key={i} className="mb-2 border-l-2 border-cyan-500/30 pl-3 py-1 hover:bg-slate-900/30 transition-colors rounded-r">
                                <span className="text-cyan-300">{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <span className="text-slate-500">Initializing stream...</span>
                          </div>
                        </div>
                    )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6 bg-amber-950/20 rounded-xl border border-amber-500/20">
                      <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-amber-400 font-mono text-sm">Connection Pending Initialization...</p>
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Task Queue */}
          <div className="border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl p-5 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                   <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                   </svg>
                   Active Directives
                 </h3>
                 <span className="text-[11px] text-slate-400 font-mono bg-slate-800/50 px-3 py-1 rounded-full">{tasks.filter(t => t.status !== 'completed').length} PENDING</span>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[200px]">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => {
                        const isCompleting = completingTasks.has(task.id);
                        const isCompleted = task.status === 'completed';
                        
                        let borderColor = 'border-slate-700/50';
                        let textColor = 'text-slate-200';
                        let priorityColor = 'text-slate-400 border-slate-600';
                        let bgColor = 'bg-slate-900/30';
                        let priorityIcon = null;
                        
                        if (task.priority === 'high') {
                            borderColor = 'border-red-500/30 hover:border-red-500/50';
                            bgColor = 'bg-gradient-to-r from-red-950/30 to-slate-900/30';
                            priorityColor = 'text-red-400 border-red-500/30 bg-red-500/10';
                            priorityIcon = (
                                <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            );
                        } else if (task.priority === 'medium') {
                            borderColor = 'border-cyan-500/30 hover:border-cyan-500/50';
                            bgColor = 'bg-gradient-to-r from-cyan-950/20 to-slate-900/30';
                            priorityColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
                            priorityIcon = (
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                            );
                        } else {
                             // Low
                             borderColor = 'border-slate-600/30 hover:border-slate-500/50';
                             priorityColor = 'text-slate-400 border-slate-500/30 bg-slate-500/10';
                             priorityIcon = (
                                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            );
                        }
                        
                        if (isCompleted) {
                            borderColor = 'border-emerald-500/30';
                            bgColor = 'bg-gradient-to-r from-emerald-950/20 to-slate-900/30';
                            textColor = 'text-emerald-400 line-through opacity-70';
                            priorityIcon = null; // Remove priority icon on complete
                        }

                        return (
                            <div 
                                key={task.id} 
                                className={`
                                    p-3 border rounded-lg flex justify-between items-center group transition-all duration-300
                                    ${borderColor} ${bgColor}
                                    ${isCompleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                                `}
                            >
                               <div className="flex items-center">
                                    <button 
                                        onClick={() => !isCompleted && handleCompleteClick(task.id)}
                                        disabled={isCompleted}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 transition-all shrink-0
                                            ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/10'}
                                        `}
                                    >
                                        {isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                    <div>
                                        <p className={`text-sm ${textColor}`}>{task.description}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{task.timestamp}</p>
                                    </div>
                               </div>
                               <div className="flex flex-col items-end gap-1 ml-2">
                                    <div className="flex items-center gap-1.5">
                                        {priorityIcon}
                                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${priorityColor}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                               </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-6 border border-dashed border-slate-700/50 rounded-lg bg-slate-900/20 text-center">
                      <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs text-slate-500 font-mono">No active directives. Awaiting input.</p>
                    </div>
                )}
             </div>

             {/* Quick Add Task */}
             <form onSubmit={handleManualAdd} className="flex gap-3 pt-4 border-t border-slate-800/50">
                <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-xs text-slate-300 font-mono focus:border-cyan-500/50 focus:outline-none uppercase cursor-pointer hover:border-slate-600"
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
                    className="flex-1 bg-slate-950 border border-slate-700/50 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500/50 focus:outline-none placeholder-slate-600"
                />
                <button 
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-cyan-900/40 hover:to-cyan-800/40 text-slate-300 hover:text-cyan-300 border border-slate-600/50 hover:border-cyan-500/50 rounded-lg text-xs font-bold uppercase transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
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
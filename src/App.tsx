import React, { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_ROSTER, 
  FILE_001_IDENTITY, 
  FILE_001_PROFILE, 
  FILE_001_ASSESSMENT, 
  FILE_001_RISK,
  FILE_001_PEER_REVIEW
} from './constants';
import { Executive, LogEntry, ConnectionStatus, Task } from './types';
import ExecutiveCard from './components/ExecutiveCard';
import Terminal from './components/Terminal';
import FileViewer from './components/FileViewer';
import ExecutiveDetail from './components/ExecutiveDetail';
import StrategyMap from './components/StrategyMap';
import KTDConsole from './components/KTDConsole';

const App: React.FC = () => {
  const [executives, setExecutives] = useState<Executive[]>(INITIAL_ROSTER);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('troupe_tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
  }, []);

  const [systemActive, setSystemActive] = useState(false);
  const [expansionActive, setExpansionActive] = useState(false);
  const [showKTD, setShowKTD] = useState(false);
  
  // Navigation State
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string | null>(null);
  
  // Command Line State
  const [commandInput, setCommandInput] = useState('');
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  // Helper to add logs
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    }]);
  }, []);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('troupe_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // "Wire In" sequence effect
  useEffect(() => {
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];

    // Initial boot sequence
    if (!systemActive && logs.length === 0) {
      addLog('Initiating Protocol: EXECUTIVE_WAR_ROOM', 'info');
      
      timeoutIds.push(setTimeout(() => {
        addLog('Secure Link Established.', 'success');
        addLog('Loading Roster manifest...', 'info');
        setSystemActive(true);
      }, 1000));

      // Sequentially connect executives
      executives.forEach((exec, index) => {
        if (exec.id === '003') return; // Skip ZEN (Self/Me), already active

        const delay = 1500 + (index * 800);
        timeoutIds.push(setTimeout(() => {
          setExecutives(prev => prev.map(e => {
            if (e.id === exec.id) {
              return { ...e, status: ConnectionStatus.CONNECTED };
            }
            return e;
          }));
          addLog(`Handshake initiated: ${exec.name} [ID:${exec.id}]`, 'warning');
          
          // Final activation delay
          timeoutIds.push(setTimeout(() => {
            setExecutives(prev => prev.map(e => {
              if (e.id === exec.id) {
                return { ...e, status: ConnectionStatus.ACTIVE };
              }
              return e;
            }));
            addLog(`${exec.name} is WIRED IN and ACTIVE.`, 'success');
          }, 600));

        }, delay));
      });
    }

    return () => timeoutIds.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExpansionProtocol = () => {
    addLog('WARNING: EXPANSION_OVERNIGHT PROTOCOL INITIATED.', 'warning');
    
    setTimeout(() => {
        setExpansionActive(true);
        addLog('Global Network Interface: ONLINE', 'success');
        addLog('Initializing massive roster wake-up sequence...', 'info');
        
        // Wake up everybody
        const pendingExecs = executives.filter(e => e.status !== ConnectionStatus.ACTIVE);
        
        pendingExecs.forEach((exec, i) => {
            setTimeout(() => {
                setExecutives(prev => prev.map(e => e.id === exec.id ? { ...e, status: ConnectionStatus.ACTIVE } : e));
                addLog(`Executive Override: ${exec.name} [ACTIVE]`, 'success');
            }, 1000 + (i * 400)); // Faster wake up
        });
    }, 1500);
  };

  const executeCommand = (cmd: string) => {
    const cmdLower = cmd.toLowerCase();

    // Command: assign: [id] [priority?] [description]
    if (cmdLower.startsWith('assign:')) {
      const parts = cmd.split(' ');
      const targetId = parts[1];
      
      // Check for priority keyword
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let descriptionParts = parts.slice(2);
      
      if (descriptionParts.length > 0) {
        const potentialPriority = descriptionParts[0].toLowerCase();
        if (['high', 'medium', 'low'].includes(potentialPriority)) {
           priority = potentialPriority as 'high' | 'medium' | 'low';
           descriptionParts = descriptionParts.slice(1);
        }
      }
      
      const description = descriptionParts.join(' ');
      const targetExec = executives.find(e => e.id === targetId || e.name.toLowerCase() === targetId.toLowerCase());

      if (targetExec && description) {
          const newTask: Task = {
              id: Date.now().toString(),
              executiveId: targetExec.id,
              description: description,
              status: 'queued',
              priority: priority,
              timestamp: new Date().toLocaleTimeString()
          };
          setTasks(prev => [...prev, newTask]);
          addLog(`JARVIS: Task confirmed. Assigned to ${targetExec.name} [ID:${targetExec.id}] with ${priority.toUpperCase()} priority.`, 'success');
      } else {
          addLog('JARVIS: Error. Invalid Executive ID or missing description.', 'error');
      }

    } else if (cmdLower.includes('initiate expansion')) {
      handleExpansionProtocol();
    } else if (cmdLower.includes('ktd')) {
      setShowKTD(true);
      addLog('ACCESS GRANTED: KNOWLEDGE & TRAINING DEPARTMENT CONSOLE', 'warning');
    } else if (cmdLower.includes('initiate')) {
      addLog(`JARVIS: Protocol sequence recognized. Initiating ${cmd.split(':')[1] || 'requested protocol'}...`, 'warning');
    } else if (cmdLower.includes('status')) {
      addLog('JARVIS: All systems nominal. Roster operating at 98% efficiency.', 'success');
    } else if (cmdLower === 'clear') {
      setLogs([]);
    } else {
      addLog('JARVIS: Command logged. Awaiting further parameters.', 'info');
    }
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    addLog(`> [USER]: ${cmd}`, 'info');

    // If awaiting confirmation
    if (pendingCommand) {
      if (cmd.toLowerCase() === 'y' || cmd.toLowerCase() === 'yes') {
        // Special check if the pending command was expansion
        if (pendingCommand.toLowerCase().includes('initiate expansion')) {
             handleExpansionProtocol();
        } else {
             executeCommand(pendingCommand);
        }
        setPendingCommand(null);
      } else {
        addLog('SYSTEM: Command execution cancelled.', 'error');
        setPendingCommand(null);
      }
      setCommandInput('');
      return;
    }

    // Safety Interlock for Critical Commands
    if (cmd.toLowerCase().startsWith('assign:') || cmd.toLowerCase().includes('initiate')) {
      setPendingCommand(cmd);
      addLog('SYSTEM: Critical command received. Execute? (Y/N)', 'warning');
      setCommandInput('');
      return;
    }

    // Non-critical commands execute immediately
    executeCommand(cmd);
    setCommandInput('');
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    // Find task for log
    const t = tasks.find(t => t.id === taskId);
    if (t) {
      addLog(`Task Completed: [${t.description}] by Executive ${t.executiveId}`, 'success');
    }
  };

  const selectedExecutive = executives.find(e => e.id === selectedExecutiveId);
  const selectedTasks = tasks.filter(t => t.executiveId === selectedExecutiveId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 p-4 lg:p-8 font-sans selection:bg-cyan-900 selection:text-cyan-100 relative">
      
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 50%)'
      }} />
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      
      {/* KTD OVERLAY */}
      {showKTD && <KTDConsole executives={executives} onClose={() => setShowKTD(false)} />}

      {/* Header */}
      <header className="mb-10 border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              TROUPE <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">INC.</span>
            </h1>
          </div>
          <h2 className="text-sm font-mono text-slate-500 uppercase tracking-[0.25em] ml-[52px]">
            Executive War Room // Tier 1 Roundtable
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">Protocol Status</div>
            <div className={`text-sm font-bold flex items-center justify-end gap-2 ${expansionActive ? 'text-red-400' : 'text-cyan-400'}`}>
              <span className={`w-2 h-2 rounded-full ${expansionActive ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
              {expansionActive ? 'EXPANSION_ACTIVE' : 'EXPANSION_OVERNIGHT'}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800 hidden md:block" />
          <button 
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border rounded-lg transition-all duration-300
            ${systemActive 
              ? 'bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
              : 'border-slate-700 text-slate-500 animate-pulse'}
            `}
          >
            <span className="flex items-center gap-2">
              {systemActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
              {systemActive ? 'System Online' : 'Initializing...'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Swaps between Dashboard and Detail View */}
      <main className="relative z-10">
        {selectedExecutive ? (
          <ExecutiveDetail 
            executive={selectedExecutive} 
            tasks={selectedTasks}
            onAddTask={(desc, priority) => {
              const newTask: Task = {
                id: Date.now().toString(),
                executiveId: selectedExecutive.id,
                description: desc,
                priority: priority,
                status: 'queued',
                timestamp: new Date().toLocaleTimeString()
              };
              setTasks(prev => [...prev, newTask]);
            }}
            onCompleteTask={handleTaskComplete}
            onBack={() => setSelectedExecutiveId(null)} 
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Roster Grid (8 cols) */}
            <div className="xl:col-span-8 space-y-8">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <h3 className="text-xl font-bold text-white">Active Roster</h3>
                  </div>
                  <span className="text-sm font-mono text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                    {executives.filter(e => e.status === ConnectionStatus.ACTIVE).length}/10
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800/50">
                  PEER_REVIEW_FRAMEWORK_V2
                </span>
              </div>
              
              {/* Executive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {executives.map((exec, index) => (
                  <div key={exec.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                    <ExecutiveCard 
                      data={exec} 
                      onClick={setSelectedExecutiveId} 
                    />
                  </div>
                ))}
              </div>

              {/* Terminal & Command Input */}
              <div className="mt-10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Command Line Interface
                  </h3>
                  <span className="text-[10px] text-slate-600 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800/50">V.2.0.4 - SECURE</span>
                </div>
                
                <Terminal logs={logs} />
                
                {/* Command Input */}
                <form onSubmit={handleSendCommand} className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 font-mono text-lg font-bold">❯</span>
                    <input 
                      type="text" 
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      placeholder={pendingCommand ? "Confirm execution? (Y/N)" : "e.g.: initiate expansion OR assign: 004 high ..."}
                      className={`w-full bg-black/60 backdrop-blur-sm border rounded-xl px-5 py-4 pl-10 font-mono text-sm text-slate-200 focus:outline-none transition-all duration-300 placeholder-slate-600
                        ${pendingCommand 
                          ? 'border-amber-500/50 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                          : 'border-slate-700/50 focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}
                      `}
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className={`px-8 py-3 border font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-xl font-semibold
                      ${pendingCommand 
                        ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-amber-500/50 text-amber-400 hover:from-amber-900/50 hover:to-amber-800/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                        : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}
                    `}
                  >
                    {pendingCommand ? 'CONFIRM' : 'EXECUTE'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: The "File" or Map (4 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{expansionActive ? 'Tactical Operations' : 'Central Intelligence'}</h3>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800/50">
                  REF: {expansionActive ? 'EXPANSION_MAP' : 'FILE_001'}
                </span>
              </div>
              
              {/* Conditional Rendering: File vs Map */}
              <div className="sticky top-6 space-y-5">
                {expansionActive ? (
                  <StrategyMap />
                ) : (
                  <FileViewer 
                    sections={[
                      FILE_001_IDENTITY,
                      FILE_001_PROFILE,
                      FILE_001_ASSESSMENT,
                      FILE_001_RISK,
                      FILE_001_PEER_REVIEW
                    ]} 
                  />
                )}
                
                {/* Action Panel */}
                <div className={`p-5 border rounded-xl transition-all duration-500 backdrop-blur-sm
                  ${expansionActive 
                    ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-slate-950/50' 
                    : 'border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-950/50'}
                `}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${expansionActive ? 'bg-cyan-500' : 'bg-amber-500 animate-pulse'}`} />
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${expansionActive ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {expansionActive ? 'Status Report' : 'Action Required'}
                    </h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {expansionActive 
                      ? "Expansion protocol active. Global nodes synchronizing. All executives instantiated." 
                      : "Roster fully instantiated. Peer Review Framework reset. Waiting for CVO command to commence expansion."
                    }
                  </p>
                  
                  <div className="space-y-3">
                    {!expansionActive && (
                      <button 
                        onClick={() => setPendingCommand('initiate expansion')}
                        className="w-full py-3 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-600/40 text-amber-400 hover:from-amber-900/50 hover:to-amber-800/40 hover:border-amber-500/60 font-mono text-xs uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Initiate Expansion
                      </button>
                    )}
                    <button 
                      onClick={() => setShowKTD(true)}
                      className="w-full py-3 bg-gradient-to-r from-red-950/30 to-red-900/20 border border-red-700/30 text-red-400 hover:from-red-950/50 hover:to-red-900/40 hover:border-red-600/50 font-mono text-xs uppercase tracking-widest rounded-lg transition-all duration-300 flex justify-between px-4 items-center group"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        KTD Console
                      </span>
                      <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">[RESTRICTED]</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;

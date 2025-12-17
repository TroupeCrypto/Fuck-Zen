'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_ROSTER, 
  FILE_001_IDENTITY, 
  FILE_001_PROFILE, 
  FILE_001_ASSESSMENT, 
  FILE_001_RISK,
  FILE_001_PEER_REVIEW
} from '../constants';
import { Executive, LogEntry, ConnectionStatus, Task } from '../types';
import ExecutiveCard from '../components/ExecutiveCard';
import CommandLineInterface from '../components/CommandLineInterface';
import FileViewer from '../components/FileViewer';
import ExecutiveDetail from '../components/ExecutiveDetail';
import StrategyMap from '../components/StrategyMap';
import KTDConsole from '../components/KTDConsole';
import SiteMenu from '../components/SiteMenu';
import JarvisOverlay from '../components/JarvisOverlay';

export default function HomePage() {
  const [executives, setExecutives] = useState<Executive[]>(INITIAL_ROSTER);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemActive, setSystemActive] = useState(false);
  const [expansionActive, setExpansionActive] = useState(false);
  const [showKTD, setShowKTD] = useState(false);
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('troupe_tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
  }, []);

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
            }, 1000 + (i * 400));
        });
    }, 1500);
  };

  const executeCommand = (cmd: string) => {
    const cmdLower = cmd.toLowerCase();

    if (cmdLower.startsWith('assign:')) {
      const parts = cmd.split(' ');
      const targetId = parts[1];
      
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

  const handleSendCommand = (cmd: string) => {
    addLog(`> [USER]: ${cmd}`, 'info');

    if (pendingCommand) {
      if (cmd.toLowerCase() === 'y' || cmd.toLowerCase() === 'yes') {
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
      return;
    }

    if (cmd.toLowerCase().startsWith('assign:') || cmd.toLowerCase().includes('initiate')) {
      setPendingCommand(cmd);
      addLog('SYSTEM: Critical command received. Execute? (Y/N)', 'warning');
      return;
    }

    executeCommand(cmd);
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    const t = tasks.find(t => t.id === taskId);
    if (t) {
      addLog(`Task Completed: [${t.description}] by Executive ${t.executiveId}`, 'success');
    }
  };

  const selectedExecutive = executives.find(e => e.id === selectedExecutiveId);
  const selectedTasks = tasks.filter(t => t.executiveId === selectedExecutiveId);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 lg:p-8 font-sans selection:bg-cyan-900 selection:text-cyan-100 relative">
      
      {/* Site Menu */}
      <SiteMenu />
      
      {/* KTD OVERLAY */}
      {showKTD && <KTDConsole executives={executives} onClose={() => setShowKTD(false)} />}

      {/* Header */}
      <header className="mb-8 border-b border-gray-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 pl-14">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
            TROUPE <span className="text-cyan-500">INC.</span>
          </h1>
          <h2 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em]">
            Executive War Room // Tier 1 Roundtable
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-mono text-gray-500">PROTOCOL</div>
            <div className={`text-sm font-bold ${expansionActive ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                {expansionActive ? 'EXPANSION_ACTIVE' : 'EXPANSION_OVERNIGHT'}
            </div>
          </div>
          <button 
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all rounded
            ${systemActive ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-gray-700 text-gray-600'}
            `}
          >
            {systemActive ? 'System Online' : 'Initializing...'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Roster Grid (8 cols) */}
            <div className="xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-lg font-bold text-white flex items-center">
                   <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                   Active Roster ({executives.filter(e => e.status === ConnectionStatus.ACTIVE).length}/10)
                 </h3>
                 <span className="text-xs font-mono text-gray-600">PEER_REVIEW_FRAMEWORK_V2</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {executives.map(exec => (
                  <ExecutiveCard 
                    key={exec.id} 
                    data={exec} 
                    onClick={setSelectedExecutiveId} 
                  />
                ))}
              </div>

              {/* Command Line Interface - New Component with Chat */}
              <div className="mt-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-mono text-gray-500 uppercase">Command Line Interface</h3>
                </div>
                
                <CommandLineInterface
                  executives={executives}
                  logs={logs}
                  onSendCommand={handleSendCommand}
                  commandInput={commandInput}
                  setCommandInput={setCommandInput}
                  pendingCommand={pendingCommand}
                />
              </div>
            </div>

            {/* Right Column: The "File" or Map (4 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{expansionActive ? 'Tactical Operations' : 'Central Intelligence'}</h3>
                <span className="text-xs font-mono text-gray-600">REF: {expansionActive ? 'EXPANSION_MAP' : 'FILE_001'}</span>
              </div>
              
              {/* Conditional Rendering: File vs Map */}
              <div className="sticky top-6">
                
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
                
                <div className={`mt-4 p-4 border rounded transition-colors duration-500
                    ${expansionActive ? 'border-cyan-900/30 bg-cyan-900/10' : 'border-yellow-900/30 bg-yellow-900/10'}
                `}>
                  <h4 className={`text-xs font-bold uppercase mb-2 ${expansionActive ? 'text-cyan-500' : 'text-yellow-500'}`}>
                    {expansionActive ? 'Status Report' : 'Action Required'}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {expansionActive 
                        ? "Expansion protocol active. Global nodes synchronizing. All executives instantiated." 
                        : "Roster fully instantiated. Peer Review Framework reset. Waiting for CVO command to commence expansion."
                    }
                  </p>
                  
                  <div className="space-y-2">
                    {!expansionActive && (
                        <button 
                            onClick={() => setPendingCommand('initiate expansion')}
                            className="w-full py-2 bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 hover:bg-yellow-900/40 hover:text-yellow-400 font-mono text-xs uppercase tracking-widest rounded transition-all"
                        >
                            Initiate Expansion
                        </button>
                    )}
                    <button 
                        onClick={() => setShowKTD(true)}
                        className="w-full py-2 bg-red-900/10 border border-red-900/30 text-red-500 hover:bg-red-900/20 font-mono text-xs uppercase tracking-widest rounded transition-all flex justify-between px-4 items-center group"
                    >
                        <span>KTD Console</span>
                        <span className="text-[10px] opacity-50 group-hover:opacity-100">[RESTRICTED]</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Jarvis Overlay - Site-wide persistent */}
      <JarvisOverlay executives={executives} />
    </div>
  );
}

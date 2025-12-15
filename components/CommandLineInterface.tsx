import React, { useState, useEffect, useRef } from 'react';
import { Executive, ChatMessage, ChatTarget, Department, LogEntry } from '../types';
import { DEPARTMENTS } from '../constants';

interface CommandLineInterfaceProps {
  executives: Executive[];
  logs: LogEntry[];
  onSendCommand: (command: string) => void;
  commandInput: string;
  setCommandInput: (value: string) => void;
  pendingCommand: string | null;
}

const CommandLineInterface: React.FC<CommandLineInterfaceProps> = ({
  executives,
  logs,
  onSendCommand,
  commandInput,
  setCommandInput,
  pendingCommand
}) => {
  const [chatMode, setChatMode] = useState(false);
  const [selectedExecutives, setSelectedExecutives] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    if (chatMode) {
      // Chat mode - create a chat message
      const target: ChatTarget = {
        type: selectedDepartments.length > 0 ? 'department' :
              selectedExecutives.length > 0 ? 'individual' :
              'broadcast',
        executiveIds: selectedExecutives.length > 0 ? selectedExecutives : undefined,
        departmentIds: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      };

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        from: 'USER',
        target,
        message: commandInput,
        status: 'sent'
      };

      setChatMessages(prev => [...prev, newMessage]);
      setCommandInput('');
      
      // Simulate response
      setTimeout(() => {
        const responder = selectedExecutives[0] || '002';
        const exec = executives.find(e => e.id === responder);
        if (exec) {
          const response: ChatMessage = {
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            from: exec.id,
            target: { type: 'individual', executiveIds: ['USER'] },
            message: `Message received: "${commandInput.substring(0, 30)}..." - Processing your request.`,
            status: 'delivered'
          };
          setChatMessages(prev => [...prev, response]);
        }
      }, 1000);
    } else {
      // Command mode - pass through to parent
      onSendCommand(commandInput);
      setCommandInput('');
    }
  };

  const toggleExecutive = (execId: string) => {
    setSelectedExecutives(prev =>
      prev.includes(execId)
        ? prev.filter(id => id !== execId)
        : [...prev, execId]
    );
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const clearSelections = () => {
    setSelectedExecutives([]);
    setSelectedDepartments([]);
  };

  const getTargetDisplay = (target: ChatTarget): string => {
    if (target.type === 'broadcast') return 'ALL';
    if (target.type === 'department' && target.departmentIds) {
      const depts = target.departmentIds.map(id => {
        const dept = DEPARTMENTS.find(d => d.id === id);
        return dept?.name || id;
      });
      return `Dept: ${depts.join(', ')}`;
    }
    if (target.type === 'individual' && target.executiveIds) {
      const execs = target.executiveIds.map(id => {
        const exec = executives.find(e => e.id === id);
        return exec?.name || id;
      });
      return execs.join(', ');
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode(false)}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider border rounded transition-all ${
              !chatMode
                ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400'
                : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600'
            }`}
          >
            Command Mode
          </button>
          <button
            onClick={() => setChatMode(true)}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider border rounded transition-all ${
              chatMode
                ? 'bg-purple-900/30 border-purple-500 text-purple-400'
                : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600'
            }`}
          >
            Chat Mode
          </button>
        </div>
        <span className="text-[10px] text-gray-600 font-mono">
          {chatMode ? 'CHAT_PROTOCOL_V1' : 'V.2.0.4 - SECURE'}
        </span>
      </div>

      {/* Chat/Log Display Area */}
      <div className="h-72 min-h-[18rem] max-h-[18rem] bg-gradient-to-b from-slate-950 to-black border border-slate-800/80 rounded-xl overflow-hidden flex flex-col font-mono text-xs shadow-2xl shadow-black/50 relative">
        {/* Subtle scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }} />
        
        {/* Header bar */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-slate-300 uppercase tracking-[0.2em] font-semibold text-[11px]">
              {chatMode ? 'Chat Interface' : 'System Log'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {chatMode && (selectedExecutives.length > 0 || selectedDepartments.length > 0) && (
              <span className="text-[10px] text-purple-400 font-mono">
                Target: {selectedExecutives.length} execs, {selectedDepartments.length} depts
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">JARVIS_v2.4</span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${chatMode ? 'bg-purple-500' : 'bg-cyan-500'}`} />
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 relative">
          {chatMode ? (
            // Chat Messages
            <>
              {chatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <span className="text-slate-600 animate-pulse">Chat mode active. Send a message...</span>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-[10px] tabular-nums">[{msg.timestamp}]</span>
                    <span className={`text-xs font-semibold ${
                      msg.from === 'USER' ? 'text-cyan-400' : 'text-purple-400'
                    }`}>
                      {msg.from === 'USER' ? 'YOU' : executives.find(e => e.id === msg.from)?.name || msg.from}
                    </span>
                    <span className="text-slate-600 text-[10px]">→ {getTargetDisplay(msg.target)}</span>
                  </div>
                  <div className="ml-4 pl-3 border-l-2 border-slate-800">
                    <p className="text-slate-300 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            // System Logs
            <>
              {logs.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <span className="text-slate-600 animate-pulse">Awaiting system output...</span>
                </div>
              )}
              {logs.slice(-50).map((log) => (
                <div 
                  key={log.id} 
                  className="flex group hover:bg-slate-900/50 px-2 py-1 -mx-2 rounded transition-colors"
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
            </>
          )}
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* Target Selector (Chat Mode Only) */}
      {chatMode && (
        <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Message Targets</span>
            <div className="flex gap-2">
              {(selectedExecutives.length > 0 || selectedDepartments.length > 0) && (
                <button
                  onClick={clearSelections}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowTargetSelector(!showTargetSelector)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                {showTargetSelector ? 'Hide' : 'Select'}
              </button>
            </div>
          </div>

          {showTargetSelector && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* Executives Selector */}
              <div className="border border-slate-700 rounded p-2 bg-slate-900/30">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Executives</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {executives.filter(e => e.id !== '003').map(exec => (
                    <label key={exec.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedExecutives.includes(exec.id)}
                        onChange={() => toggleExecutive(exec.id)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-slate-300">{exec.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departments Selector */}
              <div className="border border-slate-700 rounded p-2 bg-slate-900/30">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Departments</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {DEPARTMENTS.slice(0, 20).map(dept => (
                    <label key={dept.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept.id)}
                        onChange={() => toggleDepartment(dept.id)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-slate-300">{dept.name}</span>
                    </label>
                  ))}
                  <div className="text-[10px] text-slate-600 italic mt-2">
                    + {DEPARTMENTS.length - 20} more departments available
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Targets Display */}
          {!showTargetSelector && (selectedExecutives.length > 0 || selectedDepartments.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedExecutives.map(id => {
                const exec = executives.find(e => e.id === id);
                return exec ? (
                  <span key={id} className="text-[10px] px-2 py-1 bg-purple-900/30 border border-purple-700/50 text-purple-300 rounded">
                    {exec.name}
                  </span>
                ) : null;
              })}
              {selectedDepartments.map(id => {
                const dept = DEPARTMENTS.find(d => d.id === id);
                return dept ? (
                  <span key={id} className="text-[10px] px-2 py-1 bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 rounded">
                    {dept.name}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <div className="relative flex-1">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg ${
            chatMode ? 'text-purple-500' : 'text-cyan-500'
          }`}>
            {chatMode ? '💬' : '>'}
          </span>
          <input 
            type="text" 
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={
              chatMode
                ? "Type your message..."
                : pendingCommand 
                  ? "Confirm execution? (Y/N)" 
                  : "e.g.: initiate expansion OR assign: 004 high ..."
            }
            className={`w-full bg-black border rounded px-4 py-3 pl-10 font-mono text-sm text-gray-200 focus:outline-none focus:ring-1 placeholder-gray-700
              ${chatMode 
                ? 'border-purple-500/50 focus:border-purple-500 focus:ring-purple-500' 
                : pendingCommand 
                  ? 'border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500' 
                  : 'border-gray-800 focus:border-cyan-500 focus:ring-cyan-500'}
            `}
            autoFocus
          />
        </div>
        <button 
          type="submit"
          className={`px-6 py-2 border font-mono text-xs uppercase tracking-widest transition-all rounded
            ${chatMode
              ? 'bg-purple-900/20 border-purple-500/50 text-purple-400 hover:bg-purple-900/40'
              : pendingCommand 
                ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-900/40' 
                : 'bg-gray-900 border-gray-700 hover:border-cyan-500 hover:text-cyan-400 text-gray-400'}
          `}
        >
          {chatMode ? 'SEND' : pendingCommand ? 'CONFIRM' : 'EXECUTE'}
        </button>
      </form>
    </div>
  );
};

export default CommandLineInterface;

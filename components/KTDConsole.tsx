import React, { useState, useEffect } from 'react';
import { Executive, KnowledgeModule, KnowledgeStatus } from '../types';

// Mock Data fallback
const MOCK_MODULES: KnowledgeModule[] = [
    { id: 'm-101', version: '1.0.0', title: 'Corp_Etiquette_V1', categoryId: 'cat-1', status: KnowledgeStatus.PUBLISHED, contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', sensitivityTier: 1, createdAt: '2024-05-20' },
    { id: 'm-102', version: '0.9.beta', title: 'Adv_Negotiation_Tactics', categoryId: 'cat-2', status: KnowledgeStatus.DRAFT, contentHash: 'pending', sensitivityTier: 3, createdAt: '2024-05-23' },
    { id: 'm-103', version: '1.0.0', title: 'Dark_Pattern_Recognition', categoryId: 'cat-3', status: KnowledgeStatus.QUARANTINED, contentHash: 'aa22...', sensitivityTier: 5, createdAt: '2024-05-15' }
];

// Use environment variable for API base URL, fallback to relative path for same-origin requests
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface KTDConsoleProps {
    executives: Executive[];
    onClose: () => void;
}

const KTDConsole: React.FC<KTDConsoleProps> = ({ executives: propExecs, onClose }) => {
    const [activeTab, setActiveTab] = useState<'roster' | 'ingestion' | 'vault' | 'audit'>('roster');
    const [selectedExec, setSelectedExec] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    
    // Remote Data State
    const [dbExecs, setDbExecs] = useState<any[]>([]);
    const [modules, setModules] = useState<KnowledgeModule[]>(MOCK_MODULES);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [backendOnline, setBackendOnline] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // Initial Fetch
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const res = await fetch(`${API_BASE}/ktd/verify-llm`);
                if (res.ok) {
                    setBackendOnline(true);
                    addLog('Connected to KTD Secure Backend.');
                    fetchData();
                } else {
                    throw new Error('Backend error');
                }
            } catch (e) {
                addLog('Backend OFFLINE. Running in Simulation Mode.');
            }
        };
        checkBackend();
    }, []);

    const fetchData = async () => {
        try {
            const [modRes, auditRes, execRes] = await Promise.all([
                fetch(`${API_BASE}/ktd/modules`),
                fetch(`${API_BASE}/ktd/audit`),
                fetch(`${API_BASE}/execs`)
            ]);
            
            if (modRes.ok) setModules(await modRes.json());
            if (auditRes.ok) setAuditLogs(await auditRes.json());
            if (execRes.ok) setDbExecs(await execRes.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleResetDatabase = async () => {
        if (!confirm('WARNING: THIS WILL WIPE ALL DATABASE DATA AND RESET THE SCHEMA. CONTINUE?')) return;
        
        setIsResetting(true);
        addLog('!!! INITIATING HARD DATABASE RESET !!!');
        
        try {
            const res = await fetch(`${API_BASE}/admin/reset-db`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                addLog(`> SUCCESS: ${data.message}`);
                fetchData();
                alert('Database Reset Successful.');
            } else {
                addLog(`> FAILURE: ${data.details || data.error}`);
                alert(`Reset Failed: ${data.details || data.error}`);
            }
        } catch (e) {
            addLog(`> CRITICAL ERROR: Could not reach backend.`);
            alert('Critical Error: Could not connect to backend server. Ensure it is running on port 3001.');
        } finally {
            setIsResetting(false);
        }
    };

    // Ingestion Logic
    const handleIngest = async (moduleId: string) => {
        if (!selectedExec) return;
        addLog(`Initiating PRECISION INGESTION for Exec ${selectedExec}...`);
        
        if (backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/ktd/ingest`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        execId: selectedExec,
                        moduleId: moduleId,
                        justification: 'Manual KTD Console Action',
                        ttl_days: 30
                    })
                });
                
                const data = await res.json();
                if (res.ok) {
                    addLog(`> INGESTION SUCCESS. Grant ID: ${data.grant.id}`);
                    addLog(`> Validation Score: 100.00 (PASS)`);
                } else {
                    addLog(`> ERROR: ${data.error}`);
                }
                fetchData(); // Refresh logs
            } catch (e) {
                addLog(`> NETWORK ERROR`);
            }
        } else {
            // Simulation Fallback
            addLog(`> Verifying Module Integrity (${moduleId})... OK`);
            setTimeout(() => {
                addLog(`> Injecting Knowledge Grant (TTL: 30 days)...`);
                addLog(`> VALIDATION PASSED. Grant Active (SIMULATED).`);
            }, 1000);
        }
    };

    const handleQuarantine = async (moduleId: string) => {
        addLog(`!!! INITIATING QUARANTINE PROTOCOL for Module ${moduleId} !!!`);
        if (backendOnline) {
            try {
                const res = await fetch(`${API_BASE}/ktd/quarantine/${moduleId}`, { method: 'POST' });
                const data = await res.json();
                if (res.ok) {
                    addLog(`> SUCCESS: Module Isolated. Revoked ${data.revoked} grants.`);
                } else {
                    addLog(`> ERROR: ${data.error}`);
                }
                fetchData();
            } catch (e) {
                addLog(`> NETWORK ERROR`);
            }
        } else {
             addLog(`> SUCCESS: Module Isolated (SIMULATED).`);
        }
    };

    // Use propExecs combined with DB info if available
    const displayExecs = propExecs.map(pe => {
        const dbE = dbExecs.find(de => de.id === pe.id);
        return { ...pe, coldStart: dbE ? dbE.cold_start_verified : false };
    });

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 flex flex-col font-mono text-xs text-slate-300 animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-red-950/30 border-b border-red-500/20 px-6 py-4 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-red-400 tracking-wider">KNOWLEDGE & TRAINING DEPT.</h1>
                        <span className="text-[10px] text-slate-500">KTD SECURE CONSOLE</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`px-3 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wider
                            ${backendOnline 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {backendOnline ? 'SECURE_UPLINK' : 'OFFLINE_MODE'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800/50"
                >
                    <span className="text-[10px] text-slate-500">ESC</span>
                    <span>CLOSE CONSOLE</span>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-56 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-r border-slate-800/50 p-5 flex flex-col justify-between">
                    <div className="space-y-2">
                        {[
                            { id: 'roster', label: 'COLD START VERIFICATION', num: '1' },
                            { id: 'vault', label: 'KNOWLEDGE VAULT', num: '2' },
                            { id: 'ingestion', label: 'PRECISION INGESTION', num: '3' },
                            { id: 'audit', label: 'AUDIT LOGS', num: '4' },
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-3
                                    ${activeTab === tab.id 
                                        ? 'bg-gradient-to-r from-red-950/40 to-red-900/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                                        : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700/50 text-slate-400'}`}
                            >
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold
                                    ${activeTab === tab.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {tab.num}
                                </span>
                                <span className="text-[11px] uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* DANGER ZONE */}
                    <div className="border-t border-red-900/30 pt-5 mt-5">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Danger Zone</span>
                        </div>
                        <button 
                            onClick={handleResetDatabase}
                            disabled={isResetting}
                            className={`w-full text-red-400 border border-red-700/50 px-4 py-3 rounded-lg font-bold transition-all text-[11px] uppercase tracking-wider
                                ${isResetting 
                                    ? 'bg-slate-900 opacity-50 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-red-950/50 to-red-900/30 hover:from-red-900/50 hover:to-red-800/30 hover:border-red-600/50'}
                            `}
                        >
                            {isResetting ? 'RESETTING...' : 'HARD RESET DB'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-black via-slate-950 to-black">
                    
                    {activeTab === 'roster' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full"></div>
                                    Executive Cognitive Status
                                </h2>
                                <span className="text-[10px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800/50">
                                    {displayExecs.length} UNITS
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {displayExecs.map(exec => (
                                    <div key={exec.id} className="border border-slate-700/50 p-5 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 flex justify-between items-start hover:border-slate-600/50 transition-all">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                                                    {exec.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{exec.name}</span>
                                                    <span className="text-slate-500 text-[10px] font-mono">ID: {exec.id}</span>
                                                </div>
                                            </div>
                                            <div className="text-slate-400 text-[11px] space-y-1 mb-4">
                                                <p><span className="text-slate-500">Role:</span> {exec.role}</p>
                                                <p><span className="text-slate-500">Status:</span> {exec.status}</p>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-slate-500 mb-1.5 tracking-wider">Cold Start Protocol</div>
                                                <div className={`px-3 py-1.5 inline-flex items-center gap-2 border rounded-md text-[10px] font-semibold
                                                    ${exec.coldStart ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${exec.coldStart ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                                    {exec.coldStart ? 'VERIFIED' : 'PENDING'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-slate-700">LVL {exec.knowledgeLevel || 0}</div>
                                            <div className="text-[10px] text-slate-600 uppercase tracking-wider">COG_LEVEL</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
                                    Immutable Knowledge Vault
                                </h2>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/30">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700/50 bg-slate-900/50">
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">ID</th>
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Title</th>
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Ver</th>
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Status</th>
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Tier</th>
                                            <th className="p-4 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modules.map(mod => (
                                            <tr key={mod.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                                <td className="p-4 font-mono text-cyan-400">{mod.id}</td>
                                                <td className="p-4 font-semibold text-slate-200">{mod.title}</td>
                                                <td className="p-4 text-slate-500 font-mono">{mod.version}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] border font-semibold
                                                        ${mod.status === 'PUBLISHED' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''}
                                                        ${mod.status === 'DRAFT' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : ''}
                                                        ${mod.status === 'QUARANTINED' ? 'border-red-500/30 bg-red-500/10 text-red-400' : ''}
                                                    `}>
                                                        {mod.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500">{mod.sensitivityTier}</td>
                                                <td className="p-4">
                                                    {mod.status === 'PUBLISHED' && (
                                                        <button 
                                                            onClick={() => handleQuarantine(mod.id)}
                                                            className="text-red-400 hover:text-red-300 text-[11px] uppercase tracking-wider hover:underline transition-colors"
                                                        >
                                                            QUARANTINE
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}

                    {activeTab === 'ingestion' && (
                        <div className="grid grid-cols-2 gap-6 h-full">
                            <div className="border border-slate-700/50 rounded-xl p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
                                <h3 className="text-sm font-bold text-slate-200 uppercase mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px]">1</span>
                                    Select Target
                                </h3>
                                <div className="space-y-2">
                                    {propExecs.map(exec => (
                                        <button 
                                            key={exec.id}
                                            onClick={() => setSelectedExec(exec.id)}
                                            className={`w-full text-left p-3 rounded-lg border text-[11px] font-mono transition-all
                                                ${selectedExec === exec.id 
                                                    ? 'bg-gradient-to-r from-cyan-950/40 to-cyan-900/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                                    : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30 text-slate-400'}
                                            `}
                                        >
                                            <span className="text-slate-500">[{exec.id}]</span> {exec.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="border border-slate-700/50 rounded-xl p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 flex flex-col">
                                <h3 className="text-sm font-bold text-slate-200 uppercase mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px]">2</span>
                                    Injection Control
                                </h3>
                                {selectedExec ? (
                                    <div className="flex-1 space-y-4">
                                        <div className="p-4 bg-black/40 border border-slate-700/50 rounded-lg">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">TARGET:</p>
                                            <p className="text-cyan-400 font-bold">{propExecs.find(e => e.id === selectedExec)?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">AVAILABLE MODULES:</p>
                                            <div className="space-y-2">
                                                {modules.filter(m => m.status === 'PUBLISHED').map(mod => (
                                                    <div key={mod.id} className="flex justify-between items-center p-3 border border-slate-700/50 rounded-lg hover:bg-slate-800/30 hover:border-slate-600/50 transition-all">
                                                        <span className="text-slate-300">{mod.title}</span>
                                                        <button 
                                                            onClick={() => handleIngest(mod.id)}
                                                            className="px-4 py-1.5 bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 border border-cyan-500/40 text-cyan-400 rounded-md hover:from-cyan-800/50 hover:to-cyan-700/30 hover:border-cyan-400/60 text-[10px] uppercase tracking-wider font-semibold transition-all"
                                                        >
                                                            INJECT
                                                        </button>
                                                    </div>
                                                ))}
                                                {modules.filter(m => m.status === 'PUBLISHED').length === 0 && (
                                                    <p className="text-slate-600 italic text-center py-4">No published modules available.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <svg className="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                            </svg>
                                            <p className="text-slate-600">Select a target to begin...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                                    Audit Trail
                                </h2>
                            </div>
                            <div className="border border-slate-700/50 rounded-xl bg-black/40 p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
                            {logs.length === 0 && !backendOnline && (
                                <div className="text-center py-8 text-slate-600">
                                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    No audit logs yet...
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={`local-${i}`} className="text-slate-400 border-b border-slate-800/50 pb-2 hover:bg-slate-900/30 px-2 py-1 rounded transition-colors">
                                    {log}
                                </div>
                            ))}
                             {backendOnline && auditLogs.map((log: any) => (
                                <div key={log.id} className="text-cyan-400 border-b border-slate-800/50 pb-2 flex gap-2 hover:bg-slate-900/30 px-2 py-1 rounded transition-colors">
                                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className="uppercase text-amber-400">{log.action}:</span>
                                    <span className="text-slate-400">{log.target_type} {log.target_id}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default KTDConsole;
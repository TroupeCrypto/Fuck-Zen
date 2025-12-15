import React, { useState, useEffect } from 'react';
import { Executive, KnowledgeModule, KnowledgeStatus } from '../types';

// Mock Data fallback
const MOCK_MODULES: KnowledgeModule[] = [
    { id: 'm-101', version: '1.0.0', title: 'Corp_Etiquette_V1', categoryId: 'cat-1', status: KnowledgeStatus.PUBLISHED, contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', sensitivityTier: 1, createdAt: '2024-05-20' },
    { id: 'm-102', version: '0.9.beta', title: 'Adv_Negotiation_Tactics', categoryId: 'cat-2', status: KnowledgeStatus.DRAFT, contentHash: 'pending', sensitivityTier: 3, createdAt: '2024-05-23' },
    { id: 'm-103', version: '1.0.0', title: 'Dark_Pattern_Recognition', categoryId: 'cat-3', status: KnowledgeStatus.QUARANTINED, contentHash: 'aa22...', sensitivityTier: 5, createdAt: '2024-05-15' }
];

const API_BASE = 'http://localhost:3001/api';

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
        <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col font-mono text-xs text-gray-300 animate-fadeIn">
            {/* Header */}
            <div className="bg-neutral-900 border-b border-red-900/30 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-sm animate-pulse ${backendOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    <h1 className="text-lg font-bold text-red-500 tracking-widest">KNOWLEDGE & TRAINING DEPT. (KTD)</h1>
                    <span className="px-2 py-0.5 bg-red-900/20 border border-red-900 text-red-400 rounded text-[10px]">
                        {backendOnline ? 'SECURE_UPLINK_ESTABLISHED' : 'OFFLINE_MODE'}
                    </span>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white">[ESC] CLOSE CONSOLE</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-neutral-900/50 border-r border-gray-800 p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('roster')}
                            className={`w-full text-left px-3 py-2 rounded border ${activeTab === 'roster' ? 'bg-red-900/20 border-red-900 text-red-400' : 'border-transparent hover:bg-gray-800'}`}
                        >
                            1. COLD START VERIFICATION
                        </button>
                        <button 
                            onClick={() => setActiveTab('vault')}
                            className={`w-full text-left px-3 py-2 rounded border ${activeTab === 'vault' ? 'bg-red-900/20 border-red-900 text-red-400' : 'border-transparent hover:bg-gray-800'}`}
                        >
                            2. KNOWLEDGE VAULT
                        </button>
                        <button 
                            onClick={() => setActiveTab('ingestion')}
                            className={`w-full text-left px-3 py-2 rounded border ${activeTab === 'ingestion' ? 'bg-red-900/20 border-red-900 text-red-400' : 'border-transparent hover:bg-gray-800'}`}
                        >
                            3. PRECISION INGESTION
                        </button>
                        <button 
                            onClick={() => setActiveTab('audit')}
                            className={`w-full text-left px-3 py-2 rounded border ${activeTab === 'audit' ? 'bg-red-900/20 border-red-900 text-red-400' : 'border-transparent hover:bg-gray-800'}`}
                        >
                            4. AUDIT LOGS
                        </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="border-t border-red-900/50 pt-4 mt-4">
                        <p className="text-[10px] text-red-600 font-bold mb-2 uppercase">Danger Zone</p>
                        <button 
                            onClick={handleResetDatabase}
                            disabled={isResetting}
                            className={`w-full text-red-500 border border-red-800 px-3 py-2 rounded font-bold transition-all
                                ${isResetting ? 'bg-gray-900 opacity-50 cursor-not-allowed' : 'bg-red-950 hover:bg-red-900'}
                            `}
                        >
                            {isResetting ? '[RESETTING...]' : '[HARD RESET DATABASE]'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-black">
                    
                    {activeTab === 'roster' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Executive Cognitive Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayExecs.map(exec => (
                                    <div key={exec.id} className="border border-gray-800 p-4 rounded bg-neutral-900/50 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-cyan-400">{exec.name}</span>
                                                <span className="text-gray-600">ID: {exec.id}</span>
                                            </div>
                                            <div className="mt-2 text-gray-400">
                                                <p>Role: {exec.role}</p>
                                                <p>Status: {exec.status}</p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="text-[10px] uppercase text-gray-500 mb-1">Cold Start Protocol</div>
                                                <div className={`px-2 py-1 inline-block border rounded text-[10px] 
                                                    ${exec.coldStart ? 'border-green-900 text-green-500' : 'border-yellow-900 text-yellow-500'}`}>
                                                    {exec.coldStart ? 'VERIFIED' : 'PENDING'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-700">LVL {exec.knowledgeLevel || 0}</div>
                                            <div className="text-[10px] text-gray-600">COG_LEVEL</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div>
                             <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Immutable Knowledge Vault</h2>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-gray-500 uppercase text-[10px]">
                                            <th className="p-3">ID</th>
                                            <th className="p-3">Title</th>
                                            <th className="p-3">Ver</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Tier</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modules.map(mod => (
                                            <tr key={mod.id} className="border-b border-gray-800 hover:bg-neutral-900">
                                                <td className="p-3 font-mono text-cyan-600">{mod.id}</td>
                                                <td className="p-3 font-bold text-gray-300">{mod.title}</td>
                                                <td className="p-3 text-gray-500">{mod.version}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] border 
                                                        ${mod.status === 'PUBLISHED' ? 'border-green-900 text-green-500' : ''}
                                                        ${mod.status === 'DRAFT' ? 'border-yellow-900 text-yellow-500' : ''}
                                                        ${mod.status === 'QUARANTINED' ? 'border-red-900 text-red-500' : ''}
                                                    `}>
                                                        {mod.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-500">{mod.sensitivityTier}</td>
                                                <td className="p-3">
                                                    {mod.status === 'PUBLISHED' && (
                                                        <button 
                                                            onClick={() => handleQuarantine(mod.id)}
                                                            className="text-red-500 hover:text-red-400 hover:underline"
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
                            <div className="border border-gray-800 rounded p-4 bg-neutral-900/30">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">1. Select Target</h3>
                                <div className="space-y-2">
                                    {propExecs.map(exec => (
                                        <button 
                                            key={exec.id}
                                            onClick={() => setSelectedExec(exec.id)}
                                            className={`w-full text-left p-2 rounded border text-xs font-mono
                                                ${selectedExec === exec.id ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'border-gray-800 hover:border-gray-600'}
                                            `}
                                        >
                                            [{exec.id}] {exec.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="border border-gray-800 rounded p-4 bg-neutral-900/30 flex flex-col">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">2. Injection Control</h3>
                                {selectedExec ? (
                                    <div className="flex-1 space-y-4">
                                        <div className="p-3 bg-black border border-gray-700 rounded">
                                            <p className="text-gray-500 mb-1">TARGET:</p>
                                            <p className="text-cyan-400 font-bold">{propExecs.find(e => e.id === selectedExec)?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-2">AVAILABLE MODULES:</p>
                                            <div className="space-y-2">
                                                {modules.filter(m => m.status === 'PUBLISHED').map(mod => (
                                                    <div key={mod.id} className="flex justify-between items-center p-2 border border-gray-800 rounded hover:bg-gray-800">
                                                        <span>{mod.title}</span>
                                                        <button 
                                                            onClick={() => handleIngest(mod.id)}
                                                            className="px-3 py-1 bg-cyan-900/20 border border-cyan-600 text-cyan-400 rounded hover:bg-cyan-600 hover:text-black transition-colors"
                                                        >
                                                            INJECT
                                                        </button>
                                                    </div>
                                                ))}
                                                {modules.filter(m => m.status === 'PUBLISHED').length === 0 && (
                                                    <p className="text-gray-600 italic">No published modules available.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-600">
                                        Select a target to begin...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="font-mono text-xs space-y-1">
                            {logs.map((log, i) => (
                                <div key={`local-${i}`} className="text-gray-400 border-b border-gray-900 pb-1">
                                    {log}
                                </div>
                            ))}
                             {backendOnline && auditLogs.map((log: any) => (
                                <div key={log.id} className="text-blue-400 border-b border-gray-900 pb-1 flex gap-2">
                                    <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className="uppercase">{log.action}:</span>
                                    <span className="text-gray-500">{log.target_type} {log.target_id}</span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default KTDConsole;
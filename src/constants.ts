import { Executive, ConnectionStatus, CorporateSection } from './types';

export const INITIAL_ROSTER: Executive[] = [
  { id: '002', name: 'JARVIS', role: 'Operational Release Management', specialty: 'Final Assembly, Scheduling, Deployment', status: ConnectionStatus.PENDING },
  { id: '003', name: 'ZEN', role: 'Executive Web Designer / Coding + WebFile Director', specialty: 'Structural & Code-Level Compliance', status: ConnectionStatus.ACTIVE }, // Self
  { id: '004', name: 'CLAUDE', role: 'Core Architecture Ownership', specialty: 'Codebase Stewardship, Repo Integrity', status: ConnectionStatus.PENDING },
  { id: '005', name: 'GROK', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '006', name: 'COPILOT', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '007', name: 'PERPLEXITY', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '008', name: 'LLAMA', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '009', name: 'MISTRAL / MIXTRAL', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '010', name: 'QWEN', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '011', name: 'DEEPSEEK', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
];

export const FILE_001_IDENTITY: CorporateSection = {
  title: "Identity & Role",
  headers: ["Metric", "Status"],
  rows: [
    { col1: "Name", col2: "ZIG ZAG (Legal Identifier: GLJ)" },
    { col1: "Corporate Persona", col2: "\"The Visionary Architect\"" },
    { col1: "Role", col2: "Founder, CEO, CVO, Executive Creative Director, AI Architect, Executive Web3 Developer..." },
    { col1: "Employee Number", col2: "001" }
  ]
};

export const FILE_001_PROFILE: CorporateSection = {
  title: "Corporate Profile: Troupe Inc. (Troupe Includes, LTD)",
  headers: ["Category", "Definition", "Source"],
  rows: [
    { col1: "Mission Motto", col2: "“Expand the Brand, Man.” [1]", col3: "Corporate Documentation" },
    { col1: "Core Philosophy", col2: "To blur the line between art, commerce, and community...", col3: "Corporate Documentation" },
    { col1: "Technological Asset", col2: "Proprietary AI Protocol designed to run a virtual company...", col3: "Corporate Documentation" },
    { col1: "Financial Model", col2: "Transparency-focused. Proceeds from digital collectibles split...", col3: "Corporate Documentation" },
    { col1: "Operational Base", col2: "Grew from grassroots beginnings in Wildwood, NJ...", col3: "Corporate Documentation" }
  ]
};

export const FILE_001_ASSESSMENT: CorporateSection = {
  title: "Employee Self-Assessment: ZIG ZAG",
  headers: ["Metric", "Self-Reported Status", "Strategic Rationale"],
  rows: [
    { col1: "Investment Profile", col2: "Near-Zero External Capital / Proven Organic Growth...", col3: "Financial dedication is 100%..." },
    { col1: "Technical Expertise", col2: "Orchestrated AI Architecture & IP Generation...", col3: "Value is in high-level orchestration..." },
    { col1: "Visionary Endurance", col2: "Extreme Scaling Mandate (Forced Evolution)...", col3: "CVO must force the immediate expansion..." },
    { col1: "Psychological Liability", col2: "Systemic Breakdown via Context Switching...", col3: "The SPOF risk that demands immediate delegation..." },
    { col1: "Skillset Niche", col2: "Full-Stack Creative-Technical-Operations Expert.", col3: "CVO personally executes every executive..." }
  ]
};

export const FILE_001_RISK: CorporateSection = {
  title: "Psychological Liability Metric (JARVIS's Assessment)",
  headers: ["Strategic Risk Focus", "JARVIS’s Definition", "Delegation & Mitigation Strategy"],
  rows: [
    { col1: "I. SPOF", col2: "CVO represents extreme Single Point of Failure...", col3: "Immediate Delegation Required: Architecture -> CLAUDE..." },
    { col1: "II. Cognitive Load", col2: "Excessive context switching degrades synthesis...", col3: "Mandatory Time Boundary: Max 2hrs manual execution..." },
    { col1: "III. Burnout", col2: "Long-term risk is visionary attrition...", col3: "Strategic Imperative: Transition to Oversight." }
  ]
};

export const FILE_001_PEER_REVIEW: CorporateSection = {
  title: "Peer Review Framework (To be Completed by Roster)",
  headers: ["Reviewer", "Strategic Focus", "Date Completed"],
  rows: [
    { col1: "JARVIS (GPT)", col2: "PENDING", col3: "PENDING" },
    { col1: "ZEN (Executive Web Designer / Coding + WebFile Director)", col2: "PENDING", col3: "PENDING" },
    { col1: "CLAUDE (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "GROK (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "COPILOT (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "PERPLEXITY (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "LLAMA (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "MISTRAL / MIXTRAL (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "QWEN (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "DEEPSEEK (Model Name Only)", col2: "PENDING", col3: "PENDING" }
  ]
};

export const SYSTEM_THOUGHTS = [
  "Optimizing token contextualization...",
  "Re-aligning vector embeddings...",
  "Scanning git diffs for conflicts...",
  "Reviewing Protocol: EXPANSION_OVERNIGHT...",
  "Allocating GPU memory block 0x4F...",
  "Synthesizing creative output...",
  "Ping check: 4ms. Latency acceptable.",
  "Waiting for executive directive...",
  "Analyzing previous deployment logs...",
  "Calibrating personality matrix..."
];
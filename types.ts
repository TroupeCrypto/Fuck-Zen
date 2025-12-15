export enum ConnectionStatus {
  OFFLINE = 'OFFLINE',
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  ACTIVE = 'ACTIVE'
}

export interface Task {
  id: string;
  executiveId: string;
  description: string;
  status: 'queued' | 'processing' | 'completed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface Executive {
  id: string;
  name: string;
  role: string;
  status: ConnectionStatus;
  specialty: string;
  // KTD Extensions
  knowledgeLevel?: number; // 0-5
  lastAudit?: string;
  modules?: string[];
}

export interface TableRow {
  col1: string;
  col2: string;
  col3?: string;
}

export interface CorporateSection {
  title: string;
  headers: string[];
  rows: TableRow[];
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
}

// --- KTD & KNOWLEDGE SYSTEMS ---

export enum KnowledgeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  QUARANTINED = 'QUARANTINED',
  DEPRECATED = 'DEPRECATED'
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
}

export interface KnowledgeModule {
  id: string;
  version: string;
  title: string;
  categoryId: string;
  status: KnowledgeStatus;
  contentHash: string;
  sensitivityTier: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface KnowledgeGrant {
  id: string;
  executiveId: string;
  moduleId: string;
  grantedBy: string; // User ID
  grantedAt: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  diff: string; // JSON string
  riskScore: number;
}

export interface ValidationRun {
  id: string;
  ingestionId: string;
  status: 'PASS' | 'FAIL';
  scenariosRun: number;
  failureReason?: string;
}

// --- CHAT & MESSAGING SYSTEM ---

export type ChatTargetType = 'individual' | 'department' | 'group' | 'broadcast';

export interface ChatTarget {
  type: ChatTargetType;
  executiveIds?: string[];
  departmentIds?: string[];
  groupName?: string;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  from: string; // executive ID or 'USER'
  target: ChatTarget;
  message: string;
  status: 'sent' | 'delivered' | 'read';
}

// --- ORGANIZATIONAL HIERARCHY ---
// Structure: Division → Department → Function
// This hierarchy supports enterprise-level organization with proper firewalling and governance

export type OperationalMode = 'execution' | 'strategy' | 'hybrid';
export type RegulatoryStatus = 'standard' | 'regulated' | 'highly-regulated';

export interface Division {
  id: string;
  name: string;
  description: string;
  operationalMode: OperationalMode;
  regulatoryStatus: RegulatoryStatus;
  requiresFirewall: boolean;  // For regulated industries requiring isolation
  requiresAuditLog: boolean;  // For compliance tracking
}

export interface Department {
  id: string;
  name: string;
  description: string;
  category: string;
  // Hierarchy extensions
  divisionId?: string;        // Parent division
  operationalMode?: OperationalMode;
  regulatoryStatus?: RegulatoryStatus;
  isFunction?: boolean;       // True if this is a sub-function that rolls up to a parent department
  parentDepartmentId?: string; // Parent department for functions
}
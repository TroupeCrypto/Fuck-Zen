/**
 * AUDIT LOG MODULE
 * Server-side audit logging for all AI actions
 * Per PEER_REVIEW_FRAMEWORK_V2: Every AI action must be auditable
 */

// In-memory audit log store (would be replaced with DB in production)
let auditLogStore = [];

/**
 * Audit log entry structure
 */
export function createAuditEntry({
  action,
  actor,
  target,
  details = {},
  result = null,
  riskScore = 0
}) {
  const entry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    target,
    details,
    result,
    riskScore,
    metadata: {
      version: '2.0',
      framework: 'PEER_REVIEW_FRAMEWORK_V2'
    }
  };
  
  return entry;
}

/**
 * Write an entry to the audit log
 */
export async function writeAuditLog(entry) {
  const auditEntry = entry.id ? entry : createAuditEntry(entry);
  
  // Store in memory (would be database in production)
  auditLogStore.push(auditEntry);
  
  // Keep only last 10000 entries in memory
  if (auditLogStore.length > 10000) {
    auditLogStore = auditLogStore.slice(-10000);
  }
  
  // Console log for debugging (would be structured logging in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${auditEntry.timestamp} | ${auditEntry.action} | ${auditEntry.actor} -> ${auditEntry.target}`);
  }
  
  return auditEntry;
}

/**
 * Read audit log entries with optional filters
 */
export async function readAuditLog(filters = {}) {
  let results = [...auditLogStore];
  
  // Filter by actor
  if (filters.actor) {
    results = results.filter(e => e.actor === filters.actor || e.actor.includes(filters.actor));
  }
  
  // Filter by target
  if (filters.target) {
    results = results.filter(e => e.target === filters.target || e.target?.includes(filters.target));
  }
  
  // Filter by action
  if (filters.action) {
    results = results.filter(e => e.action === filters.action || e.action.includes(filters.action));
  }
  
  // Filter by date range
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    results = results.filter(e => new Date(e.timestamp) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    results = results.filter(e => new Date(e.timestamp) <= endDate);
  }
  
  // Filter by risk score
  if (filters.minRiskScore !== undefined) {
    results = results.filter(e => e.riskScore >= filters.minRiskScore);
  }
  
  // Sort by timestamp (newest first)
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 100;
  const offset = (page - 1) * limit;
  
  return {
    entries: results.slice(offset, offset + limit),
    total: results.length,
    page,
    limit,
    hasMore: offset + limit < results.length
  };
}

/**
 * Get audit log entries for a specific AI
 */
export async function getAIActivityLog(aiId, options = {}) {
  return readAuditLog({
    actor: `AI:${aiId}`,
    ...options
  });
}

/**
 * Get audit log entries for a specific department
 */
export async function getDepartmentActivityLog(departmentId, options = {}) {
  return readAuditLog({
    target: departmentId,
    ...options
  });
}

/**
 * Log an AI action with automatic risk scoring
 */
export async function logAIAction({
  aiId,
  aiName,
  action,
  departmentId,
  details = {},
  success = true
}) {
  // Calculate risk score based on action type
  const riskScores = {
    'deploy:execute': 80,
    'deploy:approve': 60,
    'architecture:change': 70,
    'code:generate': 30,
    'code:scaffold': 20,
    'page:create': 20,
    'route:create': 20,
    'review:approve': 40,
    'review:block': 50,
    'escalation:request': 45,
    'override:attempt': 65,
    'analysis:read': 5,
    'analysis:recommend': 10
  };
  
  let riskScore = riskScores[action] || 25;
  
  // Increase risk score for failures
  if (!success) {
    riskScore = Math.min(100, riskScore + 20);
  }
  
  // Increase risk score for regulated departments
  if (details.regulatoryStatus === 'highly-regulated') {
    riskScore = Math.min(100, riskScore + 25);
  } else if (details.regulatoryStatus === 'regulated') {
    riskScore = Math.min(100, riskScore + 15);
  }
  
  return writeAuditLog({
    action,
    actor: `AI:${aiId}`,
    target: departmentId,
    details: {
      aiName,
      success,
      ...details
    },
    result: success ? 'SUCCESS' : 'FAILURE',
    riskScore
  });
}

/**
 * Log a review action
 */
export async function logReviewAction({
  reviewerId,
  reviewerType,
  reviewRequestId,
  action,
  decision,
  comments
}) {
  return writeAuditLog({
    action: `review:${action}`,
    actor: `${reviewerType}:${reviewerId}`,
    target: reviewRequestId,
    details: {
      decision,
      comments
    },
    result: decision,
    riskScore: decision === 'BLOCK' ? 60 : decision === 'REQUEST_CHANGES' ? 40 : 20
  });
}

/**
 * Log an escalation event
 */
export async function logEscalation({
  initiatorId,
  initiatorType,
  escalationId,
  targetAiId,
  reason
}) {
  return writeAuditLog({
    action: 'escalation:created',
    actor: `${initiatorType}:${initiatorId}`,
    target: `ESCALATION:${escalationId}`,
    details: {
      targetAiId,
      reason
    },
    riskScore: 45
  });
}

/**
 * Get summary statistics for audit log
 */
export async function getAuditSummary(filters = {}) {
  const { entries } = await readAuditLog({ ...filters, limit: 10000 });
  
  const summary = {
    totalActions: entries.length,
    byActor: {},
    byAction: {},
    byResult: {},
    averageRiskScore: 0,
    highRiskActions: 0
  };
  
  let totalRisk = 0;
  
  for (const entry of entries) {
    // Count by actor
    summary.byActor[entry.actor] = (summary.byActor[entry.actor] || 0) + 1;
    
    // Count by action
    summary.byAction[entry.action] = (summary.byAction[entry.action] || 0) + 1;
    
    // Count by result
    const result = entry.result || 'UNKNOWN';
    summary.byResult[result] = (summary.byResult[result] || 0) + 1;
    
    // Risk scoring
    totalRisk += entry.riskScore || 0;
    if (entry.riskScore >= 50) {
      summary.highRiskActions++;
    }
  }
  
  summary.averageRiskScore = entries.length > 0 ? Math.round(totalRisk / entries.length) : 0;
  
  return summary;
}

/**
 * Clear audit log (for testing only)
 */
export function clearAuditLog() {
  if (process.env.NODE_ENV === 'test') {
    auditLogStore = [];
  }
}

/**
 * Get raw audit log store (for testing/debugging)
 */
export function getAuditLogStore() {
  return [...auditLogStore];
}

export default {
  createAuditEntry,
  writeAuditLog,
  readAuditLog,
  getAIActivityLog,
  getDepartmentActivityLog,
  logAIAction,
  logReviewAction,
  logEscalation,
  getAuditSummary,
  clearAuditLog,
  getAuditLogStore
};

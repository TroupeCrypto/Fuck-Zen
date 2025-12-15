/**
 * AI ESCALATION MODULE
 * Handles AI hierarchy, override logic, and escalation routing
 * Per PEER_REVIEW_FRAMEWORK_V2
 */

import { AI_SYSTEMS, AI_HIERARCHY, getAISystem, canOverride, getEscalationTarget } from '../registry/aiSystems.js';
import { getAIBinding } from '../registry/orgRegistry.js';
import { writeAuditLog } from './auditLog.js';

/**
 * AI HIERARCHY & OVERRIDE ORDER (LOCKED)
 * 1. JARVIS (Final Authority)
 * 2. CLAUDE (Architectural Veto)
 * 3. ZEN (Design & Frontend Authority)
 * 4. GPT-CLASS EXECUTIVE MODELS (Strategy / Finance)
 * 5. COPILOT (Execution)
 * 6. SPECIALISTS (Grok, Perplexity, DeepSeek, etc.)
 * 
 * RULE: NO LOWER-TIER AI MAY OVERRIDE A HIGHER-TIER DECISION.
 */

/**
 * Escalation request structure
 */
export function createEscalationRequest({
  requestId,
  initiatorAiId,
  targetDepartmentId,
  actionType,
  actionPayload,
  reason
}) {
  const timestamp = new Date().toISOString();
  
  return {
    id: requestId || `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    initiatorAiId,
    targetDepartmentId,
    actionType,
    actionPayload,
    reason,
    status: 'PENDING',
    escalationChain: [],
    resolution: null
  };
}

/**
 * Resolve escalation target based on department binding and action type
 */
export function resolveEscalationTarget(departmentId, actionType) {
  const binding = getAIBinding(departmentId);
  if (!binding) {
    // Default to JARVIS for unknown departments
    return { aiId: '002', aiName: 'JARVIS', reason: 'Default escalation target' };
  }
  
  // Action-specific escalation rules
  const escalationRules = {
    'deploy': { aiId: '002', aiName: 'JARVIS', reason: 'Production deploys require JARVIS approval' },
    'architecture': { aiId: '004', aiName: 'CLAUDE', reason: 'Architecture changes require CLAUDE approval' },
    'design': { aiId: '003', aiName: 'ZEN', reason: 'Design changes require ZEN approval' },
    'release': { aiId: '002', aiName: 'JARVIS', reason: 'Release management requires JARVIS approval' },
    'code_review': { aiId: '004', aiName: 'CLAUDE', reason: 'Code reviews escalate to CLAUDE' },
    'research': { aiId: '007', aiName: 'PERPLEXITY', reason: 'Research claims require PERPLEXITY validation' },
    'tokenomics': { aiId: '011', aiName: 'DEEPSEEK', reason: 'Tokenomics/web3 math requires DEEPSEEK analysis' },
    'localization': { aiId: '010', aiName: 'QWEN', reason: 'Localization requires QWEN approval' }
  };
  
  if (escalationRules[actionType]) {
    return escalationRules[actionType];
  }
  
  // Default: use department's escalation target or primary AI
  const targetAiId = binding.escalationTarget || binding.primaryAI;
  const targetAi = getAISystem(targetAiId);
  
  return {
    aiId: targetAiId,
    aiName: targetAi?.name || 'UNKNOWN',
    reason: `Department escalation target: ${targetAi?.name || targetAiId}`
  };
}

/**
 * Check if an AI can execute an action in a department
 */
export function canExecuteAction(aiId, departmentId, actionType, context = {}) {
  const ai = getAISystem(aiId);
  const binding = getAIBinding(departmentId);
  
  if (!ai || !binding) {
    return {
      allowed: false,
      reason: 'Invalid AI or department',
      requiresEscalation: false
    };
  }
  
  // Check if AI is primary, secondary, or execution AI for this department
  const isAuthorized = 
    binding.primaryAI === aiId ||
    binding.secondaryAI === aiId ||
    binding.executionAI === aiId;
  
  if (!isAuthorized) {
    return {
      allowed: false,
      reason: `AI ${ai.name} is not authorized for department ${departmentId}`,
      requiresEscalation: true,
      escalationTarget: resolveEscalationTarget(departmentId, actionType)
    };
  }
  
  // Check autonomy level
  const autonomyLevel = binding.autonomyLevel;
  
  // ASSIST_ONLY: cannot execute mutations
  if (autonomyLevel === 'ASSIST_ONLY') {
    if (actionType.includes('create') || actionType.includes('update') || actionType.includes('delete') || actionType.includes('deploy')) {
      return {
        allowed: false,
        reason: `ASSIST_ONLY autonomy level - cannot execute ${actionType}`,
        requiresEscalation: true,
        escalationTarget: resolveEscalationTarget(departmentId, actionType)
      };
    }
  }
  
  // PARTIAL: limited mutations, approval required for restricted actions
  if (autonomyLevel === 'PARTIAL') {
    const restrictedActions = ['deploy', 'architecture', 'release', 'delete'];
    if (restrictedActions.some(r => actionType.includes(r))) {
      return {
        allowed: false,
        reason: `PARTIAL autonomy level - ${actionType} requires approval`,
        requiresEscalation: true,
        escalationTarget: resolveEscalationTarget(departmentId, actionType)
      };
    }
  }
  
  // FULL: can execute within scope, must log
  return {
    allowed: true,
    reason: `AI ${ai.name} authorized with ${autonomyLevel} autonomy`,
    requiresEscalation: false,
    mustLog: true
  };
}

/**
 * Process an escalation request
 */
export async function processEscalation(escalationRequest) {
  const { initiatorAiId, targetDepartmentId, actionType, actionPayload, reason } = escalationRequest;
  
  // Determine escalation target
  const escalationTarget = resolveEscalationTarget(targetDepartmentId, actionType);
  
  // Add to escalation chain
  escalationRequest.escalationChain.push({
    aiId: escalationTarget.aiId,
    aiName: escalationTarget.aiName,
    timestamp: new Date().toISOString(),
    status: 'PENDING'
  });
  
  // Log the escalation
  await writeAuditLog({
    action: 'ESCALATION_REQUESTED',
    actor: `AI:${initiatorAiId}`,
    target: targetDepartmentId,
    details: {
      escalationTarget,
      actionType,
      reason
    }
  });
  
  return {
    ...escalationRequest,
    status: 'ESCALATED',
    currentHandler: escalationTarget
  };
}

/**
 * Check critical policy violations
 */
export function checkPolicyViolations(actionType, context = {}) {
  const violations = [];
  
  // Production deploy without Jarvis approval
  if (actionType === 'deploy:production' && !context.jarvisApproved) {
    violations.push({
      policy: 'DEPLOY_GATE',
      message: 'Production deploy requires JARVIS approval',
      requiredApprover: { aiId: '002', aiName: 'JARVIS' },
      severity: 'CRITICAL'
    });
  }
  
  // Architecture-breaking PR without Claude approval
  if (actionType === 'pr:merge' && context.isArchitectural && !context.claudeApproved) {
    violations.push({
      policy: 'ARCHITECTURE_GATE',
      message: 'Architecture-breaking PR requires CLAUDE approval',
      requiredApprover: { aiId: '004', aiName: 'CLAUDE' },
      severity: 'CRITICAL'
    });
  }
  
  // Design system changes without Zen approval
  if (actionType === 'design:update' && !context.zenApproved) {
    violations.push({
      policy: 'DESIGN_GATE',
      message: 'Design system changes require ZEN approval',
      requiredApprover: { aiId: '003', aiName: 'ZEN' },
      severity: 'HIGH'
    });
  }
  
  return violations;
}

/**
 * Validate override attempt
 */
export function validateOverride(actorAiId, targetAiId, decisionId) {
  const actor = getAISystem(actorAiId);
  const target = getAISystem(targetAiId);
  
  if (!actor || !target) {
    return {
      allowed: false,
      reason: 'Invalid AI system'
    };
  }
  
  if (!canOverride(actorAiId, targetAiId)) {
    return {
      allowed: false,
      reason: `${actor.name} (rank ${actor.hierarchyRank}) cannot override ${target.name} (rank ${target.hierarchyRank}). Lower-tier AI may not override higher-tier decisions.`
    };
  }
  
  return {
    allowed: true,
    reason: `${actor.name} has authority to override ${target.name}`
  };
}

/**
 * Get the full escalation path for an action
 */
export function getEscalationPath(aiId, actionType) {
  const ai = getAISystem(aiId);
  if (!ai) return [];
  
  const path = [];
  let currentRank = ai.hierarchyRank;
  
  // Build path up the hierarchy
  for (const level of AI_HIERARCHY) {
    if (level.rank < currentRank && level.aiId) {
      const levelAi = getAISystem(level.aiId);
      if (levelAi) {
        path.push({
          aiId: level.aiId,
          aiName: levelAi.name,
          authority: level.authority,
          rank: level.rank
        });
      }
    }
  }
  
  return path.sort((a, b) => b.rank - a.rank); // Nearest first
}

export default {
  createEscalationRequest,
  resolveEscalationTarget,
  canExecuteAction,
  processEscalation,
  checkPolicyViolations,
  validateOverride,
  getEscalationPath
};

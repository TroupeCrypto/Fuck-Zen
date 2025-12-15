/**
 * AI SYSTEMS REGISTRY - PEER_REVIEW_FRAMEWORK_V2
 * Canonical source of truth for all AI system definitions, roles, authority, and assignments.
 * STATUS: CANONICAL / IMPLEMENT IMMEDIATELY
 */

export const AI_ROLE_CLASSES = {
  EXECUTIVE_OPERATOR: 'EXECUTIVE_OPERATOR',
  EXECUTIVE_DESIGN_ENGINEER: 'EXECUTIVE_DESIGN_ENGINEER',
  ARCHITECTURAL_STEWARD: 'ARCHITECTURAL_STEWARD',
  STRATEGIC_ANALYST: 'STRATEGIC_ANALYST',
  EXECUTION_ENGINE: 'EXECUTION_ENGINE',
  RESEARCH_INTELLIGENCE: 'RESEARCH_INTELLIGENCE',
  INTERNAL_AUTOMATION: 'INTERNAL_AUTOMATION',
  HIGH_SPEED_OPERATOR: 'HIGH_SPEED_OPERATOR',
  MULTILINGUAL_INTELLIGENCE: 'MULTILINGUAL_INTELLIGENCE',
  DEEP_ANALYTICS_ENGINE: 'DEEP_ANALYTICS_ENGINE'
};

export const AUTHORITY_LEVELS = {
  EXECUTE_WITH_LOGGING: 'EXECUTE_WITH_LOGGING',
  OVERRIDE_LOWER_TIER: 'OVERRIDE_LOWER_TIER',
  FULL_AUTONOMY_DESIGN_CODE: 'FULL_AUTONOMY_DESIGN_CODE',
  FULL_AUTONOMY_CODEBASE: 'FULL_AUTONOMY_CODEBASE',
  BLOCK_DEPLOYS: 'BLOCK_DEPLOYS',
  ANALYSIS_ONLY: 'ANALYSIS_ONLY',
  FULL_AUTONOMY_NON_ARCHITECTURAL: 'FULL_AUTONOMY_NON_ARCHITECTURAL',
  FULL_AUTONOMY_INTERNAL: 'FULL_AUTONOMY_INTERNAL',
  FULL_AUTONOMY_TASK_LEVEL: 'FULL_AUTONOMY_TASK_LEVEL',
  FULL_AUTONOMY_LANGUAGE: 'FULL_AUTONOMY_LANGUAGE',
  ANALYSIS_RECOMMEND: 'ANALYSIS_RECOMMEND'
};

export const AUTONOMY_LEVELS = {
  ASSIST_ONLY: 'ASSIST_ONLY',
  PARTIAL: 'PARTIAL',
  FULL: 'FULL'
};

/**
 * AI SYSTEMS - Complete registry per PEER_REVIEW_FRAMEWORK_V2
 */
export const AI_SYSTEMS = {
  '002': {
    id: '002',
    name: 'JARVIS',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.EXECUTIVE_OPERATOR,
    primaryFunctions: [
      'Operational Release Management',
      'Final Assembly',
      'Scheduling',
      'Deployment Arbitration'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.EXECUTE_WITH_LOGGING,
      AUTHORITY_LEVELS.OVERRIDE_LOWER_TIER
    ],
    assignedDivisions: [
      'executive-governance',
      'technology',
      'product-design',
      'physical-ops'
    ],
    specialNotes: 'Final gatekeeper before production deploys. Owns "Go / No-Go" decisions.',
    hierarchyRank: 1
  },
  '003': {
    id: '003',
    name: 'ZEN',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.EXECUTIVE_DESIGN_ENGINEER,
    primaryFunctions: [
      'Web Design Systems',
      'Frontend Architecture',
      'File & Structural Compliance'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_DESIGN_CODE
    ],
    assignedDivisions: [
      'product-design',
      'revenue-growth',
      'content-ip'
    ],
    subDepartments: ['ux', 'ui', 'brand', 'design'],
    specialNotes: null,
    hierarchyRank: 3
  },
  '004': {
    id: '004',
    name: 'CLAUDE',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.ARCHITECTURAL_STEWARD,
    primaryFunctions: [
      'Core Architecture Ownership',
      'Repo Integrity',
      'Long-Context Reasoning'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_CODEBASE,
      AUTHORITY_LEVELS.BLOCK_DEPLOYS
    ],
    assignedDivisions: [
      'technology',
      'intelligence',
      'legal-risk'
    ],
    specialNotes: 'Acts as "Code Constitution"',
    hierarchyRank: 2
  },
  '005': {
    id: '005',
    name: 'GROK',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.STRATEGIC_ANALYST,
    primaryFunctions: [
      'Market Intelligence',
      'Cultural Trend Analysis',
      'Competitive Recon'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.ANALYSIS_ONLY
    ],
    assignedDivisions: [
      'executive-governance',
      'revenue-growth',
      'content-ip'
    ],
    specialNotes: null,
    hierarchyRank: 6
  },
  '006': {
    id: '006',
    name: 'COPILOT',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.EXECUTION_ENGINE,
    primaryFunctions: [
      'Code Generation',
      'Page & Route Scaffolding',
      'Boilerplate Expansion'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_NON_ARCHITECTURAL
    ],
    assignedDivisions: [
      'technology',
      'product-design',
      'intelligence',
      'web3-digital'
    ],
    specialNotes: 'Must obey Claude + Jarvis constraints',
    hierarchyRank: 5
  },
  '007': {
    id: '007',
    name: 'PERPLEXITY',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.RESEARCH_INTELLIGENCE,
    primaryFunctions: [
      'Live Research',
      'Source Validation',
      'External Knowledge Ingestion'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.ANALYSIS_ONLY
    ],
    assignedDivisions: [
      'intelligence',
      'executive-governance',
      'legal-risk'
    ],
    specialNotes: null,
    hierarchyRank: 6
  },
  '008': {
    id: '008',
    name: 'LLAMA',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.INTERNAL_AUTOMATION,
    primaryFunctions: [
      'Internal Tools',
      'Low-Latency Tasks',
      'On-Device / Secure Ops'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_INTERNAL
    ],
    assignedDivisions: [
      'technology',
      'physical-ops'
    ],
    specialNotes: null,
    hierarchyRank: 6
  },
  '009': {
    id: '009',
    name: 'MISTRAL',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.HIGH_SPEED_OPERATOR,
    primaryFunctions: [
      'Fast Iteration',
      'Background Jobs',
      'Bulk Transformations'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_TASK_LEVEL
    ],
    assignedDivisions: [
      'intelligence',
      'content-ip'
    ],
    specialNotes: null,
    hierarchyRank: 6
  },
  '010': {
    id: '010',
    name: 'QWEN',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.MULTILINGUAL_INTELLIGENCE,
    primaryFunctions: [
      'Localization',
      'Translation',
      'International Compliance Drafting'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.FULL_AUTONOMY_LANGUAGE
    ],
    assignedDivisions: [
      'content-ip',
      'revenue-growth'
    ],
    specialNotes: null,
    hierarchyRank: 6
  },
  '011': {
    id: '011',
    name: 'DEEPSEEK',
    status: 'ACTIVE',
    roleClass: AI_ROLE_CLASSES.DEEP_ANALYTICS_ENGINE,
    primaryFunctions: [
      'Code Analysis',
      'Algorithm Optimization',
      'Mathematical Reasoning'
    ],
    authorityLevels: [
      AUTHORITY_LEVELS.ANALYSIS_RECOMMEND
    ],
    assignedDivisions: [
      'technology',
      'intelligence',
      'web3-digital'
    ],
    specialNotes: null,
    hierarchyRank: 6
  }
};

/**
 * AI HIERARCHY & OVERRIDE ORDER (LOCKED)
 * NO LOWER-TIER AI MAY OVERRIDE A HIGHER-TIER DECISION.
 */
export const AI_HIERARCHY = [
  { rank: 1, aiId: '002', name: 'JARVIS', authority: 'Final Authority' },
  { rank: 2, aiId: '004', name: 'CLAUDE', authority: 'Architectural Veto' },
  { rank: 3, aiId: '003', name: 'ZEN', authority: 'Design & Frontend Authority' },
  { rank: 4, aiId: null, name: 'GPT-CLASS EXECUTIVE MODELS', authority: 'Strategy / Finance' },
  { rank: 5, aiId: '006', name: 'COPILOT', authority: 'Execution' },
  { rank: 6, aiId: null, name: 'SPECIALISTS', authority: 'Analysis / Research' }
];

/**
 * Get AI system by ID
 */
export function getAISystem(id) {
  return AI_SYSTEMS[id] || null;
}

/**
 * Get AI system by name
 */
export function getAISystemByName(name) {
  const normalizedName = name.toUpperCase();
  return Object.values(AI_SYSTEMS).find(ai => 
    ai.name.toUpperCase() === normalizedName
  ) || null;
}

/**
 * Get all AI systems assigned to a division
 */
export function getAISystemsForDivision(divisionId) {
  return Object.values(AI_SYSTEMS).filter(ai => 
    ai.assignedDivisions.includes(divisionId)
  );
}

/**
 * Check if an AI can override another AI based on hierarchy
 */
export function canOverride(actorAiId, targetAiId) {
  const actor = AI_SYSTEMS[actorAiId];
  const target = AI_SYSTEMS[targetAiId];
  
  if (!actor || !target) return false;
  
  return actor.hierarchyRank < target.hierarchyRank;
}

/**
 * Get escalation target for an AI
 */
export function getEscalationTarget(aiId) {
  const ai = AI_SYSTEMS[aiId];
  if (!ai) return null;
  
  const hierarchyEntry = AI_HIERARCHY.find(h => h.rank < ai.hierarchyRank && h.aiId);
  return hierarchyEntry ? AI_SYSTEMS[hierarchyEntry.aiId] : null;
}

/**
 * Determine autonomy level for an AI in a given context
 */
export function getAutonomyLevel(aiId, context = {}) {
  const ai = AI_SYSTEMS[aiId];
  if (!ai) return AUTONOMY_LEVELS.ASSIST_ONLY;
  
  const { actionType, divisionId } = context;
  
  // Specialists are analysis-only
  if (ai.authorityLevels.includes(AUTHORITY_LEVELS.ANALYSIS_ONLY)) {
    return AUTONOMY_LEVELS.ASSIST_ONLY;
  }
  
  // Analysis + Recommend gets partial
  if (ai.authorityLevels.includes(AUTHORITY_LEVELS.ANALYSIS_RECOMMEND)) {
    return AUTONOMY_LEVELS.PARTIAL;
  }
  
  // Check if AI is assigned to this division
  if (divisionId && !ai.assignedDivisions.includes(divisionId)) {
    return AUTONOMY_LEVELS.ASSIST_ONLY;
  }
  
  // Full autonomy AIs
  const fullAutonomyLevels = [
    AUTHORITY_LEVELS.FULL_AUTONOMY_CODEBASE,
    AUTHORITY_LEVELS.FULL_AUTONOMY_DESIGN_CODE,
    AUTHORITY_LEVELS.FULL_AUTONOMY_NON_ARCHITECTURAL,
    AUTHORITY_LEVELS.FULL_AUTONOMY_INTERNAL,
    AUTHORITY_LEVELS.FULL_AUTONOMY_TASK_LEVEL,
    AUTHORITY_LEVELS.FULL_AUTONOMY_LANGUAGE
  ];
  
  if (ai.authorityLevels.some(level => fullAutonomyLevels.includes(level))) {
    return AUTONOMY_LEVELS.FULL;
  }
  
  return AUTONOMY_LEVELS.PARTIAL;
}

export default AI_SYSTEMS;

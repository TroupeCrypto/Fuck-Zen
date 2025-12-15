/**
 * RBAC ROLES REGISTRY - Role-Based Access Control
 * Per PEER_REVIEW_FRAMEWORK_V2
 */

export const RBAC_ROLES = {
  OWNER: {
    id: 'OWNER',
    name: 'Owner',
    description: 'Ziggy - Ultimate authority over all systems',
    level: 0,
    permissions: ['*'],
    canOverrideAll: true
  },
  EXEC_AI: {
    id: 'EXEC_AI',
    name: 'Executive AI',
    description: 'JARVIS - Final operational authority',
    level: 1,
    permissions: [
      'deploy:approve',
      'deploy:block',
      'deploy:execute',
      'release:manage',
      'override:lower_tier',
      'audit:read',
      'audit:write',
      'system:configure'
    ],
    aiId: '002'
  },
  ARCH_STEWARD: {
    id: 'ARCH_STEWARD',
    name: 'Architectural Steward',
    description: 'CLAUDE - Code constitution and architectural authority',
    level: 2,
    permissions: [
      'architecture:approve',
      'architecture:block',
      'code:review',
      'code:approve',
      'deploy:block',
      'pr:block',
      'audit:read',
      'audit:write'
    ],
    aiId: '004'
  },
  DESIGN_STEWARD: {
    id: 'DESIGN_STEWARD',
    name: 'Design Steward',
    description: 'ZEN - Design and frontend authority',
    level: 3,
    permissions: [
      'design:approve',
      'design:block',
      'frontend:approve',
      'frontend:execute',
      'ui:full_autonomy',
      'audit:read',
      'audit:write'
    ],
    aiId: '003'
  },
  EXECUTION_ENGINE: {
    id: 'EXECUTION_ENGINE',
    name: 'Execution Engine',
    description: 'COPILOT - Code generation and scaffolding',
    level: 5,
    permissions: [
      'code:generate',
      'code:scaffold',
      'page:create',
      'route:create',
      'audit:write'
    ],
    aiId: '006',
    constraints: ['must_obey_claude', 'must_obey_jarvis']
  },
  ANALYST: {
    id: 'ANALYST',
    name: 'Analyst',
    description: 'Analysis-only AI systems (Grok, Perplexity, DeepSeek, Qwen, Llama, Mistral)',
    level: 6,
    permissions: [
      'analysis:read',
      'analysis:recommend',
      'research:execute',
      'audit:write'
    ],
    aiIds: ['005', '007', '008', '009', '010', '011']
  },
  HUMAN_ADMIN: {
    id: 'HUMAN_ADMIN',
    name: 'Human Admin',
    description: 'Human administrators with elevated privileges',
    level: 4,
    permissions: [
      'system:configure',
      'user:manage',
      'audit:read',
      'audit:write',
      'review:approve',
      'review:request_changes'
    ]
  }
};

/**
 * Permission categories for validation
 */
export const PERMISSION_CATEGORIES = {
  DEPLOY: ['deploy:approve', 'deploy:block', 'deploy:execute'],
  ARCHITECTURE: ['architecture:approve', 'architecture:block'],
  CODE: ['code:generate', 'code:scaffold', 'code:review', 'code:approve'],
  DESIGN: ['design:approve', 'design:block', 'frontend:approve', 'frontend:execute', 'ui:full_autonomy'],
  RELEASE: ['release:manage'],
  AUDIT: ['audit:read', 'audit:write'],
  SYSTEM: ['system:configure'],
  USER: ['user:manage'],
  REVIEW: ['review:approve', 'review:request_changes', 'review:block'],
  PAGE: ['page:create'],
  ROUTE: ['route:create'],
  ANALYSIS: ['analysis:read', 'analysis:recommend'],
  RESEARCH: ['research:execute'],
  PR: ['pr:block']
};

/**
 * Get role by ID
 */
export function getRole(roleId) {
  return RBAC_ROLES[roleId] || null;
}

/**
 * Get role for an AI by its ID
 */
export function getRoleForAI(aiId) {
  for (const role of Object.values(RBAC_ROLES)) {
    if (role.aiId === aiId) return role;
    if (role.aiIds && role.aiIds.includes(aiId)) return role;
  }
  return null;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(roleId, permission) {
  const role = getRole(roleId);
  if (!role) return false;
  
  // Owner has all permissions
  if (role.permissions.includes('*')) return true;
  
  return role.permissions.includes(permission);
}

/**
 * Check if a role can override another role
 */
export function canRoleOverride(actorRoleId, targetRoleId) {
  const actor = getRole(actorRoleId);
  const target = getRole(targetRoleId);
  
  if (!actor || !target) return false;
  if (actor.canOverrideAll) return true;
  
  return actor.level < target.level;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleId) {
  const role = getRole(roleId);
  if (!role) return [];
  
  if (role.permissions.includes('*')) {
    return Object.values(PERMISSION_CATEGORIES).flat();
  }
  
  return role.permissions;
}

/**
 * Validate action against role constraints
 */
export function validateRoleAction(roleId, action, context = {}) {
  const role = getRole(roleId);
  if (!role) {
    return { allowed: false, reason: 'Invalid role' };
  }
  
  // Check basic permission
  if (!hasPermission(roleId, action)) {
    return { allowed: false, reason: `Role ${roleId} does not have permission: ${action}` };
  }
  
  // Check role constraints
  if (role.constraints) {
    for (const constraint of role.constraints) {
      if (constraint === 'must_obey_claude' && context.claudeBlocked) {
        return { allowed: false, reason: 'Action blocked by CLAUDE (Architectural Steward)' };
      }
      if (constraint === 'must_obey_jarvis' && context.jarvisBlocked) {
        return { allowed: false, reason: 'Action blocked by JARVIS (Executive AI)' };
      }
    }
  }
  
  return { allowed: true };
}

/**
 * Get the escalation chain for a role
 */
export function getEscalationChain(roleId) {
  const role = getRole(roleId);
  if (!role) return [];
  
  const chain = [];
  const levels = Object.values(RBAC_ROLES)
    .filter(r => r.level < role.level)
    .sort((a, b) => b.level - a.level);
  
  for (const higherRole of levels) {
    chain.push(higherRole);
  }
  
  return chain;
}

export default RBAC_ROLES;

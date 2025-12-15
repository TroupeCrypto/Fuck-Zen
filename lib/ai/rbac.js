/**
 * RBAC ENFORCEMENT MODULE
 * Enforces role-based access control for AI actions
 * Per PEER_REVIEW_FRAMEWORK_V2
 */

import { RBAC_ROLES, getRole, getRoleForAI, hasPermission, validateRoleAction } from '../registry/rbacRoles.js';
import { getAISystem, AUTONOMY_LEVELS, getAutonomyLevel } from '../registry/aiSystems.js';
import { getAIBinding } from '../registry/orgRegistry.js';
import { writeAuditLog } from './auditLog.js';

/**
 * RBAC Context for request processing
 */
export function createRBACContext({
  actorId,
  actorType, // 'AI' | 'HUMAN'
  targetDepartmentId,
  action,
  resource,
  metadata = {}
}) {
  const timestamp = new Date().toISOString();
  
  let role = null;
  let aiSystem = null;
  
  if (actorType === 'AI') {
    aiSystem = getAISystem(actorId);
    role = getRoleForAI(actorId);
  } else {
    // Human users - look up role from metadata or default to HUMAN_ADMIN
    role = metadata.role ? getRole(metadata.role) : RBAC_ROLES.HUMAN_ADMIN;
  }
  
  return {
    timestamp,
    actorId,
    actorType,
    aiSystem,
    role,
    targetDepartmentId,
    action,
    resource,
    metadata,
    binding: targetDepartmentId ? getAIBinding(targetDepartmentId) : null
  };
}

/**
 * Check if an action is allowed based on RBAC rules
 */
export function checkAccess(context) {
  const { actorId, actorType, role, action, targetDepartmentId, binding, aiSystem } = context;
  
  // No role = no access
  if (!role) {
    return {
      allowed: false,
      reason: 'No valid role found for actor',
      code: 'NO_ROLE'
    };
  }
  
  // Check basic permission
  if (!hasPermission(role.id, action)) {
    return {
      allowed: false,
      reason: `Role ${role.name} does not have permission: ${action}`,
      code: 'PERMISSION_DENIED'
    };
  }
  
  // For AI actors, check autonomy level
  if (actorType === 'AI' && binding) {
    const autonomyLevel = binding.autonomyLevel;
    
    // Map actions to required autonomy levels
    const actionAutonomyRequirements = {
      'deploy:execute': AUTONOMY_LEVELS.FULL,
      'deploy:approve': AUTONOMY_LEVELS.PARTIAL,
      'code:generate': AUTONOMY_LEVELS.PARTIAL,
      'code:scaffold': AUTONOMY_LEVELS.PARTIAL,
      'page:create': AUTONOMY_LEVELS.PARTIAL,
      'route:create': AUTONOMY_LEVELS.PARTIAL,
      'design:approve': AUTONOMY_LEVELS.FULL,
      'architecture:approve': AUTONOMY_LEVELS.FULL
    };
    
    const requiredAutonomy = actionAutonomyRequirements[action];
    if (requiredAutonomy) {
      const autonomyRank = {
        [AUTONOMY_LEVELS.ASSIST_ONLY]: 0,
        [AUTONOMY_LEVELS.PARTIAL]: 1,
        [AUTONOMY_LEVELS.FULL]: 2
      };
      
      if (autonomyRank[autonomyLevel] < autonomyRank[requiredAutonomy]) {
        return {
          allowed: false,
          reason: `Action ${action} requires ${requiredAutonomy} autonomy, but department has ${autonomyLevel}`,
          code: 'INSUFFICIENT_AUTONOMY',
          requiredAutonomy,
          currentAutonomy: autonomyLevel
        };
      }
    }
    
    // Check if AI is authorized for this department
    if (binding) {
      const isAuthorized = 
        binding.primaryAI === actorId ||
        binding.secondaryAI === actorId ||
        binding.executionAI === actorId;
      
      if (!isAuthorized) {
        return {
          allowed: false,
          reason: `AI ${aiSystem?.name || actorId} is not authorized for this department`,
          code: 'NOT_AUTHORIZED_DEPARTMENT'
        };
      }
    }
  }
  
  // Check role constraints
  const constraintValidation = validateRoleAction(role.id, action, context.metadata);
  if (!constraintValidation.allowed) {
    return {
      allowed: false,
      reason: constraintValidation.reason,
      code: 'CONSTRAINT_VIOLATION'
    };
  }
  
  return {
    allowed: true,
    reason: 'Access granted',
    code: 'ACCESS_GRANTED',
    role: role.id,
    autonomyLevel: binding?.autonomyLevel
  };
}

/**
 * Enforce RBAC for an action - throws if not allowed
 */
export async function enforceAccess(context) {
  const result = checkAccess(context);
  
  // Log the access check
  await writeAuditLog({
    action: 'RBAC_CHECK',
    actor: `${context.actorType}:${context.actorId}`,
    target: context.targetDepartmentId || context.resource,
    details: {
      requestedAction: context.action,
      result: result.code,
      allowed: result.allowed,
      reason: result.reason
    }
  });
  
  if (!result.allowed) {
    const error = new Error(result.reason);
    error.code = result.code;
    error.rbacResult = result;
    throw error;
  }
  
  return result;
}

/**
 * Get all allowed actions for an actor in a department
 */
export function getAllowedActions(actorId, actorType, targetDepartmentId) {
  const context = createRBACContext({
    actorId,
    actorType,
    targetDepartmentId,
    action: '', // Will be checked individually
    resource: ''
  });
  
  if (!context.role) {
    return [];
  }
  
  const allActions = context.role.permissions.includes('*')
    ? ['*']
    : context.role.permissions;
  
  return allActions.filter(action => {
    if (action === '*') return true;
    const checkContext = { ...context, action };
    return checkAccess(checkContext).allowed;
  });
}

/**
 * Middleware factory for RBAC enforcement
 */
export function createRBACMiddleware(options = {}) {
  const { extractActor, extractDepartment, extractAction } = options;
  
  return async function rbacMiddleware(req, res, next) {
    try {
      const actorId = extractActor ? extractActor(req) : req.headers['x-ai-id'] || req.session?.userId;
      const actorType = req.headers['x-ai-id'] ? 'AI' : 'HUMAN';
      const departmentId = extractDepartment ? extractDepartment(req) : req.params?.departmentSlug;
      const action = extractAction ? extractAction(req) : `${req.method.toLowerCase()}:${req.path}`;
      
      const context = createRBACContext({
        actorId,
        actorType,
        targetDepartmentId: departmentId,
        action,
        resource: req.path,
        metadata: {
          method: req.method,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
      
      const result = await enforceAccess(context);
      
      // Attach RBAC info to request for downstream use
      req.rbac = {
        context,
        result,
        actorRole: context.role,
        autonomyLevel: context.binding?.autonomyLevel
      };
      
      if (next) next();
      return result;
      
    } catch (error) {
      if (error.code && error.rbacResult) {
        // RBAC error
        if (res) {
          return res.status(403).json({
            ok: false,
            error: error.message,
            code: error.code,
            rbac: error.rbacResult
          });
        }
        throw error;
      }
      // Unexpected error
      if (res) {
        return res.status(500).json({
          ok: false,
          error: 'Internal RBAC error'
        });
      }
      throw error;
    }
  };
}

/**
 * Check if actor has specific role level or higher
 */
export function hasRoleLevel(actorId, actorType, requiredLevel) {
  let role;
  if (actorType === 'AI') {
    role = getRoleForAI(actorId);
  } else {
    role = RBAC_ROLES.HUMAN_ADMIN;
  }
  
  if (!role) return false;
  return role.level <= requiredLevel;
}

/**
 * Get effective permissions for an actor
 */
export function getEffectivePermissions(actorId, actorType, departmentId = null) {
  const context = createRBACContext({
    actorId,
    actorType,
    targetDepartmentId: departmentId,
    action: '',
    resource: ''
  });
  
  if (!context.role) return [];
  
  let permissions = [...(context.role.permissions || [])];
  
  // Filter by autonomy level if department is specified
  if (departmentId && context.binding) {
    const autonomyLevel = context.binding.autonomyLevel;
    
    if (autonomyLevel === AUTONOMY_LEVELS.ASSIST_ONLY) {
      // Remove mutation permissions
      permissions = permissions.filter(p => 
        !p.includes('create') && 
        !p.includes('update') && 
        !p.includes('delete') &&
        !p.includes('execute')
      );
    } else if (autonomyLevel === AUTONOMY_LEVELS.PARTIAL) {
      // Remove critical permissions
      permissions = permissions.filter(p =>
        !p.includes('deploy:execute') &&
        !p.includes('architecture')
      );
    }
  }
  
  return permissions;
}

export default {
  createRBACContext,
  checkAccess,
  enforceAccess,
  getAllowedActions,
  createRBACMiddleware,
  hasRoleLevel,
  getEffectivePermissions
};

export const runtime = "nodejs";

import { json, badRequest, serverError } from "../_utils/respond.js";
import { buildOrgTree, getDivision, getDepartment, getSubDepartment, getAIBinding } from "../../../lib/registry/orgRegistry.js";
import { getAISystem } from "../../../lib/registry/aiSystems.js";

/**
 * GET /api/org - Get full org tree or specific entity
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get('division');
    const departmentId = searchParams.get('department');
    const subDeptId = searchParams.get('subDept');
    
    // Get specific sub-department
    if (subDeptId) {
      const subDept = getSubDepartment(subDeptId);
      if (!subDept) {
        return badRequest(`Sub-department not found: ${subDeptId}`);
      }
      const binding = getAIBinding(subDeptId);
      return json(200, {
        ok: true,
        subDepartment: {
          ...subDept,
          binding,
          primaryAI: getAISystem(binding?.primaryAI),
          secondaryAI: getAISystem(binding?.secondaryAI),
          executionAI: getAISystem(binding?.executionAI)
        }
      });
    }
    
    // Get specific department
    if (departmentId) {
      const dept = getDepartment(departmentId);
      if (!dept) {
        return badRequest(`Department not found: ${departmentId}`);
      }
      const binding = getAIBinding(departmentId);
      return json(200, {
        ok: true,
        department: {
          ...dept,
          binding,
          primaryAI: getAISystem(binding?.primaryAI),
          secondaryAI: getAISystem(binding?.secondaryAI),
          executionAI: getAISystem(binding?.executionAI)
        }
      });
    }
    
    // Get specific division
    if (divisionId) {
      const division = getDivision(divisionId);
      if (!division) {
        return badRequest(`Division not found: ${divisionId}`);
      }
      return json(200, {
        ok: true,
        division: {
          ...division,
          primaryAI: getAISystem(division.primaryAI),
          secondaryAI: getAISystem(division.secondaryAI)
        }
      });
    }
    
    // Get full org tree
    const tree = buildOrgTree();
    return json(200, {
      ok: true,
      orgTree: tree
    });
    
  } catch (error) {
    console.error('Org API error:', error);
    return serverError('Failed to fetch organization data');
  }
}

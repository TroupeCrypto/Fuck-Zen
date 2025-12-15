export const runtime = "nodejs";

import { json, badRequest, serverError } from "../_utils/respond.js";
import { 
  readAuditLog, 
  getAIActivityLog, 
  getDepartmentActivityLog,
  getAuditSummary
} from "../../../lib/ai/auditLog.js";

/**
 * GET /api/audit - Get audit log entries
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get('type'); // 'ai', 'department', 'summary', or null for general
    const aiId = searchParams.get('aiId');
    const departmentId = searchParams.get('departmentId');
    
    const filters = {
      actor: searchParams.get('actor') || undefined,
      target: searchParams.get('target') || undefined,
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minRiskScore: searchParams.get('minRiskScore') ? parseInt(searchParams.get('minRiskScore')) : undefined,
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 100
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    // Get summary
    if (type === 'summary') {
      const summary = await getAuditSummary(filters);
      return json(200, {
        ok: true,
        summary
      });
    }
    
    // Get AI activity log
    if (type === 'ai' && aiId) {
      const result = await getAIActivityLog(aiId, filters);
      return json(200, {
        ok: true,
        aiId,
        ...result
      });
    }
    
    // Get department activity log
    if (type === 'department' && departmentId) {
      const result = await getDepartmentActivityLog(departmentId, filters);
      return json(200, {
        ok: true,
        departmentId,
        ...result
      });
    }
    
    // Get general audit log
    const result = await readAuditLog(filters);
    return json(200, {
      ok: true,
      ...result
    });
    
  } catch (error) {
    console.error('Audit GET error:', error);
    return serverError('Failed to fetch audit logs');
  }
}

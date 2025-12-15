export const runtime = "nodejs";

import { json, badRequest, serverError, forbidden } from "../_utils/respond.js";
import { readJson } from "../_utils/body.js";
import { 
  createReviewRequest, 
  submitReview, 
  getReviewRequest, 
  getReviewRequests,
  mergeReviewRequest,
  closeReviewRequest,
  CHANGE_CATEGORIES,
  REVIEW_DECISION
} from "../../../lib/review/reviewRequest.js";

/**
 * GET /api/reviews - List review requests
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      reviewerId: searchParams.get('reviewerId') || undefined,
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 50
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const result = getReviewRequests(filters);
    
    return json(200, {
      ok: true,
      ...result
    });
    
  } catch (error) {
    console.error('Reviews GET error:', error);
    return serverError('Failed to fetch review requests');
  }
}

/**
 * POST /api/reviews - Create a new review request
 */
export async function POST(req) {
  try {
    const body = await readJson(req);
    if (!body) {
      return badRequest('Expected application/json body');
    }
    
    const { title, description, category, changeType, authorId, authorType, departmentId, files, metadata } = body;
    
    // Validate required fields
    if (!title || !category || !authorId || !authorType) {
      return badRequest('Missing required fields: title, category, authorId, authorType');
    }
    
    // Validate category
    if (!Object.values(CHANGE_CATEGORIES).includes(category)) {
      return badRequest(`Invalid category. Must be one of: ${Object.values(CHANGE_CATEGORIES).join(', ')}`);
    }
    
    // Validate author type
    if (!['AI', 'HUMAN'].includes(authorType)) {
      return badRequest('authorType must be AI or HUMAN');
    }
    
    const request = createReviewRequest({
      title,
      description: description || '',
      category,
      changeType: changeType || 'code',
      authorId,
      authorType,
      departmentId: departmentId || null,
      files: files || [],
      metadata: metadata || {}
    });
    
    return json(201, {
      ok: true,
      reviewRequest: request
    });
    
  } catch (error) {
    console.error('Reviews POST error:', error);
    return serverError('Failed to create review request');
  }
}

/**
 * PATCH /api/reviews - Submit a review or update request status
 */
export async function PATCH(req) {
  try {
    const body = await readJson(req);
    if (!body) {
      return badRequest('Expected application/json body');
    }
    
    const { action, reviewRequestId, reviewerId, reviewerType, decision, comments, mergedBy, closedBy, closeReason } = body;
    
    if (!reviewRequestId) {
      return badRequest('reviewRequestId is required');
    }
    
    const existingRequest = getReviewRequest(reviewRequestId);
    if (!existingRequest) {
      return badRequest(`Review request not found: ${reviewRequestId}`);
    }
    
    // Handle different actions
    switch (action) {
      case 'submit_review': {
        if (!reviewerId || !reviewerType || !decision) {
          return badRequest('Missing required fields for submit_review: reviewerId, reviewerType, decision');
        }
        
        if (!Object.values(REVIEW_DECISION).includes(decision)) {
          return badRequest(`Invalid decision. Must be one of: ${Object.values(REVIEW_DECISION).join(', ')}`);
        }
        
        const result = await submitReview({
          reviewRequestId,
          reviewerId,
          reviewerType,
          decision,
          comments: comments || ''
        });
        
        return json(200, {
          ok: true,
          reviewRequest: result.request,
          review: result.review
        });
      }
      
      case 'merge': {
        if (!mergedBy) {
          return badRequest('mergedBy is required for merge action');
        }
        
        if (!existingRequest.canMerge) {
          return forbidden(`Cannot merge review request. Status: ${existingRequest.status}`);
        }
        
        const mergedRequest = await mergeReviewRequest(reviewRequestId, mergedBy);
        
        return json(200, {
          ok: true,
          reviewRequest: mergedRequest
        });
      }
      
      case 'close': {
        if (!closedBy) {
          return badRequest('closedBy is required for close action');
        }
        
        const closedRequest = await closeReviewRequest(reviewRequestId, closedBy, closeReason || 'Closed without merge');
        
        return json(200, {
          ok: true,
          reviewRequest: closedRequest
        });
      }
      
      default:
        return badRequest(`Invalid action. Must be one of: submit_review, merge, close`);
    }
    
  } catch (error) {
    console.error('Reviews PATCH error:', error);
    if (error.message.includes('not found') || error.message.includes('cannot be merged')) {
      return badRequest(error.message);
    }
    return serverError('Failed to update review request');
  }
}

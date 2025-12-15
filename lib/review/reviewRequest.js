/**
 * PEER REVIEW SYSTEM - Review Request Model and Routing
 * Per PEER_REVIEW_FRAMEWORK_V2
 * 
 * Implements:
 * - REVIEW_REQUEST record creation
 * - Automatic reviewer assignment by category
 * - APPROVE / REQUEST_CHANGES / BLOCK decisions
 * - BLOCK enforcement from Claude or Jarvis
 * 
 * NOTE: This implementation uses in-memory storage for demonstration.
 * For production, replace with database persistence (PostgreSQL, MongoDB, etc.)
 */

import { getAISystem, AI_SYSTEMS } from '../registry/aiSystems.js';
import { logReviewAction, writeAuditLog } from '../ai/auditLog.js';
import { generateId } from '../utils/idGenerator.js';

// AI ID Constants for required reviewers
const AI_IDS = {
  JARVIS: '002',
  ZEN: '003',
  CLAUDE: '004',
  GROK: '005',
  COPILOT: '006',
  PERPLEXITY: '007',
  LLAMA: '008',
  MISTRAL: '009',
  QWEN: '010',
  DEEPSEEK: '011'
};

// In-memory review store
// PRODUCTION: Replace with database queries (e.g., pg pool from lib/db)
let reviewStore = [];

/**
 * Review request statuses
 */
export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  BLOCKED: 'BLOCKED',
  MERGED: 'MERGED',
  CLOSED: 'CLOSED'
};

/**
 * Review decisions
 */
export const REVIEW_DECISION = {
  APPROVE: 'APPROVE',
  REQUEST_CHANGES: 'REQUEST_CHANGES',
  BLOCK: 'BLOCK'
};

/**
 * Change categories that determine required reviewers
 */
export const CHANGE_CATEGORIES = {
  ARCHITECTURE: 'ARCHITECTURE',
  UI_DESIGN: 'UI_DESIGN',
  DEPLOY_RELEASE: 'DEPLOY_RELEASE',
  RESEARCH_CLAIMS: 'RESEARCH_CLAIMS',
  TOKENOMICS_WEB3: 'TOKENOMICS_WEB3',
  LOCALIZATION: 'LOCALIZATION',
  CODE_GENERAL: 'CODE_GENERAL',
  CONTENT: 'CONTENT',
  CONFIG: 'CONFIG'
};

/**
 * Required reviewers by category per PEER_REVIEW_FRAMEWORK_V2
 */
export const REQUIRED_REVIEWERS = {
  [CHANGE_CATEGORIES.ARCHITECTURE]: {
    required: [AI_IDS.CLAUDE],
    optional: [AI_IDS.COPILOT],
    description: 'Architecture changes require CLAUDE approval'
  },
  [CHANGE_CATEGORIES.UI_DESIGN]: {
    required: [AI_IDS.ZEN],
    optional: [AI_IDS.COPILOT],
    description: 'UI/Design changes require ZEN approval'
  },
  [CHANGE_CATEGORIES.DEPLOY_RELEASE]: {
    required: [AI_IDS.JARVIS],
    optional: [AI_IDS.CLAUDE],
    description: 'Deploy/Release requires JARVIS approval'
  },
  [CHANGE_CATEGORIES.RESEARCH_CLAIMS]: {
    required: [AI_IDS.PERPLEXITY],
    optional: [AI_IDS.GROK],
    description: 'Research claims require PERPLEXITY validation'
  },
  [CHANGE_CATEGORIES.TOKENOMICS_WEB3]: {
    required: [AI_IDS.DEEPSEEK],
    optional: [AI_IDS.CLAUDE],
    description: 'Tokenomics/web3 math requires DEEPSEEK analysis'
  },
  [CHANGE_CATEGORIES.LOCALIZATION]: {
    required: [AI_IDS.QWEN],
    optional: [AI_IDS.MISTRAL],
    description: 'Localization requires QWEN approval'
  },
  [CHANGE_CATEGORIES.CODE_GENERAL]: {
    required: [AI_IDS.COPILOT],
    optional: [AI_IDS.CLAUDE], // CLAUDE optional for complex changes
    description: 'Code changes require COPILOT review'
  },
  [CHANGE_CATEGORIES.CONTENT]: {
    required: [AI_IDS.ZEN],
    optional: [AI_IDS.MISTRAL],
    description: 'Content changes require ZEN review'
  },
  [CHANGE_CATEGORIES.CONFIG]: {
    required: [AI_IDS.COPILOT],
    optional: [AI_IDS.LLAMA],
    description: 'Config changes require COPILOT review'
  }
};

/**
 * Create a review request
 */
export function createReviewRequest({
  title,
  description,
  category,
  changeType, // 'code' | 'content' | 'config'
  authorId,
  authorType, // 'AI' | 'HUMAN'
  departmentId,
  files = [],
  metadata = {}
}) {
  const id = generateId('REVIEW');
  const timestamp = new Date().toISOString();
  
  // Determine required reviewers based on category
  const reviewerConfig = REQUIRED_REVIEWERS[category] || REQUIRED_REVIEWERS[CHANGE_CATEGORIES.CODE_GENERAL];
  
  const request = {
    id,
    title,
    description,
    category,
    changeType,
    authorId,
    authorType,
    departmentId,
    files,
    metadata,
    status: REVIEW_STATUS.PENDING,
    createdAt: timestamp,
    updatedAt: timestamp,
    requiredReviewers: reviewerConfig.required.map(aiId => ({
      aiId,
      aiName: getAISystem(aiId)?.name || 'UNKNOWN',
      status: 'PENDING',
      decision: null,
      comments: null,
      reviewedAt: null
    })),
    optionalReviewers: reviewerConfig.optional.map(aiId => ({
      aiId,
      aiName: getAISystem(aiId)?.name || 'UNKNOWN',
      status: 'NOT_REQUESTED',
      decision: null,
      comments: null,
      reviewedAt: null
    })),
    reviews: [],
    canMerge: false,
    isBlocked: false,
    blockedBy: null
  };
  
  // Store the request
  reviewStore.push(request);
  
  return request;
}

/**
 * Submit a review for a request
 */
export async function submitReview({
  reviewRequestId,
  reviewerId,
  reviewerType, // 'AI' | 'HUMAN'
  decision,
  comments
}) {
  const request = getReviewRequest(reviewRequestId);
  if (!request) {
    throw new Error(`Review request ${reviewRequestId} not found`);
  }
  
  const timestamp = new Date().toISOString();
  
  // Create review record
  const review = {
    id: generateId('REV'),
    reviewerId,
    reviewerType,
    decision,
    comments,
    timestamp
  };
  
  request.reviews.push(review);
  
  // Update reviewer status
  const requiredReviewer = request.requiredReviewers.find(r => r.aiId === reviewerId);
  if (requiredReviewer) {
    requiredReviewer.status = 'COMPLETED';
    requiredReviewer.decision = decision;
    requiredReviewer.comments = comments;
    requiredReviewer.reviewedAt = timestamp;
  }
  
  const optionalReviewer = request.optionalReviewers.find(r => r.aiId === reviewerId);
  if (optionalReviewer) {
    optionalReviewer.status = 'COMPLETED';
    optionalReviewer.decision = decision;
    optionalReviewer.comments = comments;
    optionalReviewer.reviewedAt = timestamp;
  }
  
  // Check for BLOCK decisions from Claude or Jarvis
  if (decision === REVIEW_DECISION.BLOCK) {
    if (reviewerId === AI_IDS.JARVIS || reviewerId === AI_IDS.CLAUDE) {
      // BLOCK from Jarvis or Claude prevents merge/deploy
      request.isBlocked = true;
      request.blockedBy = {
        aiId: reviewerId,
        aiName: getAISystem(reviewerId)?.name,
        timestamp,
        reason: comments
      };
      request.status = REVIEW_STATUS.BLOCKED;
    }
  }
  
  // Update request status and canMerge
  updateRequestStatus(request);
  
  request.updatedAt = timestamp;
  
  // Log the review action
  await logReviewAction({
    reviewerId,
    reviewerType,
    reviewRequestId,
    action: 'submit',
    decision,
    comments
  });
  
  return { request, review };
}

/**
 * Update request status based on reviews
 */
function updateRequestStatus(request) {
  // If blocked, cannot merge
  if (request.isBlocked) {
    request.canMerge = false;
    request.status = REVIEW_STATUS.BLOCKED;
    return;
  }
  
  // Check if all required reviewers have approved
  const allRequiredApproved = request.requiredReviewers.every(
    r => r.decision === REVIEW_DECISION.APPROVE
  );
  
  // Check for any changes requested
  const hasChangesRequested = request.reviews.some(
    r => r.decision === REVIEW_DECISION.REQUEST_CHANGES
  );
  
  if (hasChangesRequested) {
    request.status = REVIEW_STATUS.CHANGES_REQUESTED;
    request.canMerge = false;
  } else if (allRequiredApproved) {
    request.status = REVIEW_STATUS.APPROVED;
    request.canMerge = true;
  } else {
    request.status = REVIEW_STATUS.IN_REVIEW;
    request.canMerge = false;
  }
}

/**
 * Get a review request by ID
 */
export function getReviewRequest(id) {
  return reviewStore.find(r => r.id === id) || null;
}

/**
 * Get all review requests with optional filters
 */
export function getReviewRequests(filters = {}) {
  let results = [...reviewStore];
  
  if (filters.status) {
    results = results.filter(r => r.status === filters.status);
  }
  
  if (filters.category) {
    results = results.filter(r => r.category === filters.category);
  }
  
  if (filters.authorId) {
    results = results.filter(r => r.authorId === filters.authorId);
  }
  
  if (filters.departmentId) {
    results = results.filter(r => r.departmentId === filters.departmentId);
  }
  
  if (filters.reviewerId) {
    results = results.filter(r => 
      r.requiredReviewers.some(rev => rev.aiId === filters.reviewerId) ||
      r.optionalReviewers.some(rev => rev.aiId === filters.reviewerId)
    );
  }
  
  // Sort by creation date (newest first)
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;
  
  return {
    requests: results.slice(offset, offset + limit),
    total: results.length,
    page,
    limit,
    hasMore: offset + limit < results.length
  };
}

/**
 * Get pending reviews for a specific AI
 */
export function getPendingReviewsForAI(aiId) {
  return reviewStore.filter(r => 
    r.status !== REVIEW_STATUS.MERGED &&
    r.status !== REVIEW_STATUS.CLOSED &&
    (
      r.requiredReviewers.some(rev => rev.aiId === aiId && rev.status === 'PENDING') ||
      r.optionalReviewers.some(rev => rev.aiId === aiId && rev.status === 'REQUESTED')
    )
  );
}

/**
 * Merge a review request (after approval)
 */
export async function mergeReviewRequest(reviewRequestId, mergedBy) {
  const request = getReviewRequest(reviewRequestId);
  if (!request) {
    throw new Error(`Review request ${reviewRequestId} not found`);
  }
  
  if (!request.canMerge) {
    throw new Error(`Review request ${reviewRequestId} cannot be merged. Status: ${request.status}`);
  }
  
  request.status = REVIEW_STATUS.MERGED;
  request.mergedAt = new Date().toISOString();
  request.mergedBy = mergedBy;
  request.updatedAt = request.mergedAt;
  
  await writeAuditLog({
    action: 'review:merged',
    actor: mergedBy,
    target: reviewRequestId,
    details: {
      title: request.title,
      category: request.category,
      reviewsCount: request.reviews.length
    }
  });
  
  return request;
}

/**
 * Close a review request (without merging)
 */
export async function closeReviewRequest(reviewRequestId, closedBy, reason) {
  const request = getReviewRequest(reviewRequestId);
  if (!request) {
    throw new Error(`Review request ${reviewRequestId} not found`);
  }
  
  request.status = REVIEW_STATUS.CLOSED;
  request.closedAt = new Date().toISOString();
  request.closedBy = closedBy;
  request.closeReason = reason;
  request.updatedAt = request.closedAt;
  
  await writeAuditLog({
    action: 'review:closed',
    actor: closedBy,
    target: reviewRequestId,
    details: {
      title: request.title,
      reason
    }
  });
  
  return request;
}

/**
 * Determine reviewers for a set of files
 */
export function determineReviewersForFiles(files, departmentId) {
  const categories = new Set();
  
  for (const file of files) {
    const path = file.path || file;
    
    // Architecture files
    if (path.includes('architecture') || path.includes('schema') || path.includes('database')) {
      categories.add(CHANGE_CATEGORIES.ARCHITECTURE);
    }
    
    // UI/Design files
    if (path.includes('.css') || path.includes('.scss') || path.includes('component') || path.includes('design')) {
      categories.add(CHANGE_CATEGORIES.UI_DESIGN);
    }
    
    // Deploy/Release files
    if (path.includes('deploy') || path.includes('release') || path.includes('.github/workflows') || path.includes('vercel.json')) {
      categories.add(CHANGE_CATEGORIES.DEPLOY_RELEASE);
    }
    
    // Tokenomics/Web3 files
    if (path.includes('contract') || path.includes('token') || path.includes('web3') || path.includes('.sol')) {
      categories.add(CHANGE_CATEGORIES.TOKENOMICS_WEB3);
    }
    
    // Localization files
    if (path.includes('locale') || path.includes('i18n') || path.includes('translation')) {
      categories.add(CHANGE_CATEGORIES.LOCALIZATION);
    }
    
    // Config files
    if (path.includes('config') || path.includes('.json') || path.includes('.env')) {
      categories.add(CHANGE_CATEGORIES.CONFIG);
    }
    
    // Content files
    if (path.includes('.md') || path.includes('.mdx') || path.includes('content/')) {
      categories.add(CHANGE_CATEGORIES.CONTENT);
    }
    
    // General code
    if (path.includes('.js') || path.includes('.ts') || path.includes('.jsx') || path.includes('.tsx')) {
      categories.add(CHANGE_CATEGORIES.CODE_GENERAL);
    }
  }
  
  // Collect all required and optional reviewers
  const requiredReviewers = new Set();
  const optionalReviewers = new Set();
  
  for (const category of categories) {
    const config = REQUIRED_REVIEWERS[category];
    if (config) {
      config.required.forEach(id => requiredReviewers.add(id));
      config.optional.forEach(id => optionalReviewers.add(id));
    }
  }
  
  // Remove from optional if already in required
  for (const id of requiredReviewers) {
    optionalReviewers.delete(id);
  }
  
  return {
    categories: Array.from(categories),
    required: Array.from(requiredReviewers).map(id => ({
      aiId: id,
      aiName: getAISystem(id)?.name
    })),
    optional: Array.from(optionalReviewers).map(id => ({
      aiId: id,
      aiName: getAISystem(id)?.name
    }))
  };
}

/**
 * Clear review store (for testing)
 */
export function clearReviewStore() {
  if (process.env.NODE_ENV === 'test') {
    reviewStore = [];
  }
}

export default {
  REVIEW_STATUS,
  REVIEW_DECISION,
  CHANGE_CATEGORIES,
  REQUIRED_REVIEWERS,
  createReviewRequest,
  submitReview,
  getReviewRequest,
  getReviewRequests,
  getPendingReviewsForAI,
  mergeReviewRequest,
  closeReviewRequest,
  determineReviewersForFiles,
  clearReviewStore
};

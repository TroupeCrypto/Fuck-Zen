/**
 * ID GENERATOR UTILITY
 * Centralized ID generation to avoid collisions
 */

let idCounter = 0;

/**
 * Generate a unique ID with a given prefix
 * Uses timestamp + counter + random string for uniqueness
 * @param {string} prefix - Prefix for the ID (e.g., 'AUDIT', 'REVIEW', 'ESC')
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'ID') {
  idCounter = (idCounter + 1) % 1000000;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${idCounter.toString().padStart(6, '0')}-${random}`;
}

/**
 * Generate a short unique ID (for internal use)
 * @returns {string} Short unique ID
 */
export function generateShortId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Reset ID counter (for testing purposes only)
 */
export function resetIdCounter() {
  if (process.env.NODE_ENV === 'test') {
    idCounter = 0;
  }
}

export default {
  generateId,
  generateShortId,
  resetIdCounter
};

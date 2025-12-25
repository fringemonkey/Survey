/**
 * Branching logic helpers
 * 
 * NOTE: Branching logic is now handled server-side in functions/api/submit.js
 * This file is kept for reference but is not currently used by the frontend.
 * 
 * The server-side determineBranch() function in submit.js handles branch assignment
 * based on which form sections are filled out.
 */

/**
 * Determines which form sections should be shown based on responses
 * @param {Object} responses - Current form responses
 * @returns {Object} Object with boolean flags for each section
 */
export function getVisibleSections(responses) {
  return {
    stability: true, // Always show stability section (required)
    quests: responses.showOptionalSections !== false,
    exploration: responses.showOptionalSections !== false,
    lore: responses.showOptionalSections !== false,
    general: true,
  }
}

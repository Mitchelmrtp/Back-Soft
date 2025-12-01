// 🔄 Async Handler - Utility for handling async route functions
// Eliminates the need for try-catch blocks in every route handler

/**
 * Async handler wrapper for Express route handlers
 * Automatically catches async errors and passes them to Express error middleware
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Wrap the async function call and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
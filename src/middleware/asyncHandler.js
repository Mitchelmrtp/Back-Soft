/**
 * Async handler wrapper to eliminate try-catch boilerplate
 * Wraps async functions to automatically catch errors and pass them to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
/**
 * Wraps async route handlers so Express catches promise rejections.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

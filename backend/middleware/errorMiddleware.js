/**
 * Central error handler — keeps JSON responses consistent.
 */
export function errorMiddleware(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Server error'
      : err.message || 'Server error';
  res.status(status).json({ message });
}

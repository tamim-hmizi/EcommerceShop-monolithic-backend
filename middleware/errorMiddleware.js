export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    success: false,
    message: err.message || "Server Error",
  });
};

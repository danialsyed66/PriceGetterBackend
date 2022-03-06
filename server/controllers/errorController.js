const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;
  error.message = err.message || 'Internal Server Error';
  error.status = err.status || 'error';
  error.stack = err.stack;

  if (err.name === 'CastError') {
    const message = `Object with ${error.path}: ${error.value} not found`;
    error = new AppError(message, 404);
  }

  if (err.name === 'ValidationError') error = new AppError(err.message, 400);

  if (err.name === '11000') {
    const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = `Json Web Token is not a valid. Please try again`;
    error = new AppError(message, 400);
  }

  if (err.name === 'TokenExpiredError') {
    const message = `Json Web Token has exp. Please try again`;
    error = new AppError(message, 400);
  }

  if (process.env.NODE_ENV === 'DEVELOPMENT')
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error,
    });

  res.status(error.statusCode).json({
    status: error.status,
    error: error.message,
  });
};

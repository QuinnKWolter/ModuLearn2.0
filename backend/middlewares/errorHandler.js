const pino = require('pino');
const logger = pino();

const errorHandler = (err, req, res, next) => {
  // Log the full error details including stack trace
  logger.error({
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      // If it's a Sequelize error, add additional details
      ...(err.original && { 
        sqlMessage: err.original.message,
        sqlState: err.original.sqlState,
        sqlError: err.original.sqlError 
      })
    }
  }, 'Request error');

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = [];

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Conflict';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.statusCode) {
    // Custom errors with status codes
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(errors.length > 0 && { errors })
    }
  });
};

module.exports = errorHandler;
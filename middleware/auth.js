"use strict";

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const AppError = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

const verifyToken = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
  return decoded;
};

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

const protect = authMiddleware;
const restrict = restrictTo;

module.exports = {
  catchAsync,
  AppError,
  signToken,
  protect,
  restrict
};
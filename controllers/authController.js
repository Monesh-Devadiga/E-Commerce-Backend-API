"use strict";

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../middleware/auth');

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });
  
  const token = user.generateAuthToken();
  
  res.status(201).json({
    success: true,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 401));
  }
  
  user.lastLogin = Date.now();
  await user.save();
  
  const token = user.generateAuthToken();
  
  res.status(200).json({
    success: true,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    }
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const updates = req.body;
  
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(204).json({
    success: true,
    data: null
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }
  
  const resetToken = user.generateAuthToken();
  
  const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password reset link sent to email',
    resetURL
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  deleteMe,
  forgotPassword
};
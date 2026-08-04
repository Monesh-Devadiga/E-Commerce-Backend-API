"use strict";

const User = require('../models/User');

const getAllUsers = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const skip = (options.page - 1) * options.limit;
    
    const users = await User.find()
      .skip(skip)
      .limit(options.limit)
      .select('-password');
    
    const total = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      results: users.length,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: total,
        pages: Math.ceil(total / options.limit)
      },
      data: {
        users: users
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return next(new Error('No user found with that ID', 404));
    }
    res.status(200).json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const token = newUser.generateAuthToken();
    
    newUser.password = undefined;
    
    res.status(201).json({
      success: true,
      token: token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');
    
    if (!user) {
      return next(new Error('No user found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return next(new Error('No user found with that ID', 404));
    }
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
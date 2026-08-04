"use strict";

const Order = require('../models/Order');

const getAllOrders = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: req.query.sort || '-createdAt'
    };

    const skip = (options.page - 1) * options.limit;
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit);
    
    const total = await Order.countDocuments();
    
    res.status(200).json({
      success: true,
      results: orders.length,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: total,
        pages: Math.ceil(total / options.limit)
      },
      data: {
        orders: orders
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'name price');
    
    if (!order) {
      return next(new Error('No order found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        order: order
      }
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        order: order
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!order) {
      return next(new Error('No order found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        order: order
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return next(new Error('No order found with that ID', 404));
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
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
};
"use strict";

const Product = require('../models/Product');

const getAllProducts = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: req.query.sort || '-createdAt',
      search: req.query.search || ''
    };

    const filter = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.priceMin) {
      filter.price = { $gte: parseFloat(req.query.priceMin) };
    }
    
    if (req.query.priceMax) {
      filter.price = { ...filter.price, $lte: parseFloat(req.query.priceMax) };
    }
    
    if (req.query.isFeatured) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }
    
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (options.search) {
      filter.$text = { $search: options.search };
    }

    const skip = (options.page - 1) * options.limit;
    
    let query = Product.find(filter)
      .populate('category', 'name description')
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit);
    
    if (options.search) {
      query = query.select('score');
    }
    
    const products = await query;
    
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      results: products.length,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: total,
        pages: Math.ceil(total / options.limit)
      },
      data: {
        products: products
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    
    if (!product) {
      return next(new Error('No product found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        product: product
      }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        product: product
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name description');
    
    if (!product) {
      return next(new Error('No product found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        product: product
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return next(new Error('No product found with that ID', 404));
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
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
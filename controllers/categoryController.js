"use strict";

const Category = require('../models/Category');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      results: categories.length,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return next(new Error('No category found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        category: category
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        category: category
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!category) {
      return next(new Error('No category found with that ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        category: category
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return next(new Error('No category found with that ID', 404));
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
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
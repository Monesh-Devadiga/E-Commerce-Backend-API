"use strict";

const Cart = require('../models/Cart');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId }).populate('items.product', 'name price images');
    
    if (!cart) {
      return next(new Error('No cart found with that user ID', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCart = async (req, res, next) => {
  try {
    const cart = await Cart.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    
    if (!cart) {
      cart = new Cart({ user: req.params.userId, items: [] });
    }
    
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1;
    const price = req.body.price;
    const name = req.body.name;
    
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: price,
        name: name
      });
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    
    if (!cart) {
      return next(new Error('No cart found with that user ID', 404));
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === req.params.productId
    );
    
    if (itemIndex === -1) {
      return next(new Error('Item not found in cart', 404));
    }
    
    cart.items.splice(itemIndex, 1);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    
    if (!cart) {
      return next(new Error('No cart found with that user ID', 404));
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === req.params.productId
    );
    
    if (itemIndex === -1) {
      return next(new Error('Item not found in cart', 404));
    }
    
    cart.items[itemIndex].quantity = req.body.quantity || 1;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    
    if (!cart) {
      return next(new Error('No cart found with that user ID', 404));
    }
    
    cart.items = [];
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  createCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};
"use strict";

const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    trim: true,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, {
  timestamps: true
});

CartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.tax = this.subtotal * 0.1;
  this.total = this.subtotal + this.tax + (this.total - this.subtotal - this.tax);
  
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
"use strict";

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { protect, restrict } = require('../middleware/auth');

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);

// Protected routes (require authentication)
router.get('/auth/me', protect, authController.getMe);
router.patch('/auth/me', protect, authController.updateMe);
router.delete('/auth/me', protect, authController.deleteMe);

// User management (admin only)
router.get('/users', protect, restrict('admin'), userController.getAllUsers);
router.get('/users/:id', protect, restrict('admin'), userController.getUser);
router.post('/users', protect, restrict('admin'), userController.createUser);
router.patch('/users/:id', protect, restrict('admin'), userController.updateUser);
router.delete('/users/:id', protect, restrict('admin'), userController.deleteUser);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', protect, restrict('admin'), productController.createProduct);
router.patch('/products/:id', protect, restrict('admin'), productController.updateProduct);
router.delete('/products/:id', protect, restrict('admin'), productController.deleteProduct);

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', protect, restrict('admin'), categoryController.createCategory);
router.patch('/categories/:id', protect, restrict('admin'), categoryController.updateCategory);
router.delete('/categories/:id', protect, restrict('admin'), categoryController.deleteCategory);

// Cart routes
router.get('/cart/:userId', protect, cartController.getCart);
router.post('/cart/:userId', protect, cartController.createCart);
router.post('/cart/:userId/add', protect, cartController.addToCart);
router.delete('/cart/:userId/:productId', protect, cartController.removeFromCart);
router.patch('/cart/:userId/:productId', protect, cartController.updateCartItem);
router.delete('/cart/:userId/clear', protect, cartController.clearCart);

// Order routes
router.get('/orders', protect, orderController.getAllOrders);
router.get('/orders/:id', protect, orderController.getOrder);
router.post('/orders', protect, orderController.createOrder);
router.patch('/orders/:id', protect, restrict('admin'), orderController.updateOrder);
router.delete('/orders/:id', protect, restrict('admin'), orderController.deleteOrder);

module.exports = router;
const express = require('express');
const router = express.Router();

const {signUp, signIn, getProfile, updateProfile} = require('../controllers/userController');
const {listing, fetchByFilter, fetchById, updateListing, deleteListing} = require('../controllers/productController');
const {createCart, updateCart, getCart, deleteCart} = require('../controllers/cartController');
const {createOrder, updateOrder} = require('../controllers/orderController');
const {authentication} = require('../middleware/auth');

//*User's API endpoint
router.post('/register', signUp);
router.post('/login', signIn);
router.get('/user/:userId/profile', authentication, getProfile);
router.put('/user/:userId/profile', authentication, updateProfile);

//*Product's API endpoint
router.post('/products', listing);
router.get('/products', fetchByFilter);
router.get('/products/:productId', fetchById);
router.put('/products/:productId', updateListing);
router.delete('/products/:productId', deleteListing);

//*Cart API endpoint
router.post('/users/:userId/cart', authentication, createCart);
router.put('/users/:userId/cart', authentication, updateCart);
router.get('/users/:userId/cart', authentication, getCart);
router.delete('/users/:userId/cart',authentication, deleteCart);

//*Order's API endpoint
router.post('/users/:userId/orders', createOrder);
router.put('/users/:userId/orders', updateOrder);

router.all('/**', (a, b) => {
    b.status(404).json({status: false, message: 'No such URL Exists'});
})

module.exports = router;
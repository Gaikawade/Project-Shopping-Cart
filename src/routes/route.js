const express = require('express');
const router = express.Router();

const {signUp, signIn, getProfile, updateProfile} = require('../controllers/userController');
const {listing, productByFilter, productById, updateListing, deleteListing} = require('../controllers/productController');
const {authentication} = require('../middleware/auth');

router.post('/register', signUp);
router.post('/login', signIn);
router.get('/user/:userId/profile', authentication, getProfile);
router.put('/user/:userId/profile', updateProfile);

router.post('/products', listing);
router.get('/products', productByFilter);
router.get('/products/:productId', productById);
router.put('/products/:productId', updateListing);
router.delete('/products/:productId', deleteListing);

router.all('/**', (res) => {
    res.status(404).json({status: false, message: 'No such URL Found'});
})

module.exports = router;
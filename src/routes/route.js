const express = require('express');
const router = express.Router();

const {signUp, signIn, getProfile, updateProfile} = require('../controllers/userController');
const {listing, fetchByFilter, fetchById, updateListing, deleteListing} = require('../controllers/productController');
const {authentication} = require('../middleware/auth');

router.post('/register', signUp);
router.post('/login', signIn);
router.get('/user/:userId/profile', authentication, getProfile);
router.put('/user/:userId/profile', authentication, updateProfile);

router.post('/products', listing);
router.get('/products', fetchByFilter);
router.get('/products/:productId', fetchById);
router.put('/products/:productId', updateListing);
router.delete('/products/:productId', deleteListing);

router.all('/**', (req, res) => {
    res.status(404).json({status: false, message: 'No such URL Found'});
})

module.exports = router;
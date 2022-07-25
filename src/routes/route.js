const express = require('express');
const router = express.Router();

const {signUp, signIn, getProfile, updateProfile} = require('../controllers/userController');
const {authentication} = require('../middleware/auth');

router.post('/register', signUp);
router.post('/login', signIn);
router.get('/user/:userId/profile', authentication, getProfile);
router.put('/user/:userId/profile', updateProfile);

router.all('/**', (res) => {
    res.status(404).json({status: false, message: 'No such URL Found'});
})

module.exports = router;
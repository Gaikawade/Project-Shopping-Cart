const express = require('express');
const router = express.Router();

const {registerUser, userLogin} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', userLogin);

router.all('/**', (res) => {
    res.statusCode(404).json({status: false, message: 'No such URL Found'});
})

module.exports = router;
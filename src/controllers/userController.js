const bcrypt = require('bcrypt');
const salt = await bcrypt.genSalt(10);
const userModel = require('../models/userModel');

const registerUser = async (req, res) => {
    try{

    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const userLogin = async (req, res) => {
    try{

    }
    catch(err){
        res.stauts(500).json({status: false, message: err.message});
    }
}

const getProfile = async (req, res) => {
    try{

    }
    catch(err){
        res.stauts(500).json({status: false, message: err.message});
    }
}

module.exports = {registerUser, userLogin, getProfile, }
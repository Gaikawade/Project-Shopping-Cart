const {isValidObjectId} = require('mongoose');
const bcrypt = require('bcrypt');
const salt = await bcrypt.genSalt(10);
const userModel = require('../models/userModel');
const {isValidName, isValidEmail, isValidPassword, isValidPhone, isValidPincode} = require('../validation/validator');
const {uploadFile} = require('../middleware/awsS3'); 

const signUp = async (req, res) => {
    try{
        let data = req.body;
        if(!Object.keys(data).length > 0) return res.status(400).json({status: false, message: 'Please enter User details'});
        let {fname, lname, email, password, phone, address} = data;

        if(!fname)    return res.status(400).json({status: false, message: `Please enter User's first name`});
        if(!lname)    return res.status(400).json({status: false, message: `Please enter User's last name`});
        if(!email)    return res.status(400).json({status: false, message: `Please enter User's email address`});
        if(!password) return res.status(400).json({status: false, message: `Please enter User's password`});
        if(!phone)    return res.status(400).json({status: false, message: `Please enter User's phone number`});
        if(!address)  return res.status(400).json({status: false, message: `Please enter User's address`});

        if(isValidName(fname)) return res.status(400).json({status: false, message: `Please enter a valid first name`});
        if(isValidName(lname)) return res.status(400).json({status: false, message: `Please enter a valid last name`});
        if(isValidEmail(email)) return res.status(400).json({status: false, message: `Please enter a valid email address`});
        if(isValidPassword(password)) return res.status(400).json({status: false, message: `Password Should be 8-15 characters which contains at least one numeric digit, one uppercase and one special character`});
        if(isValidPhone(phone)) return res.status(400).json({status: false, message: `Please enter a valid phone number`});
        
        address = JSON.parse(address);
        let {shipping, billing} = address;
        if(!shipping) return res.status(400).json({status: false, message: `Please enter shipping address`});
        if(!billing) return res.status(400).json({status: false, message: `Please enter billing address`});

        let file = req.files;
        if(file && file.length > 0){
            if(isValidFile) return res.status(200).json({status: false, message: `Please upload jpeg/jpg/png format file only`});
            let image = await uploadFile(file[0]);
        }
        let profileImage = image;
        data['profileImage'] = profileImage;
        let userData = await userModel.create(data);
        res.status(201).json({status: true, message: 'Sign Up Successfull', data: 'userData'})
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const signIn = async (req, res) => {
    try{

    }
    catch(err){
        res.stauts(500).json({status: false, message: err.message});
    }
}

const getProfile = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!userId) return res.status(400).json({status: false, message: 'User Id is required'});

        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: 'User Id is not valid'});

        const user = await userModel.findOne({_id: userId});
        if(user) return res.status(200).json({status: true, message: 'User Profile Details', data: user});
        else return res.status(404).json({status: false, message: 'User not found'});
    }
    catch(err){
        res.stauts(500).json({status: false, message: err.message});
    }
}

const updateProfile = async (req, res) => {
    try{

    }
    catch(err){
        res.stauts(500).json({status: false, message: err.message});
    }
}

module.exports = {signUp, signIn, getProfile, updateProfile};
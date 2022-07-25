const {isValidObjectId} = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const {isValidName, isValidEmail, isValidPassword, isValidPhone, isValidPincode, isValidFile} = require('../validation/validator');
const {uploadFile} = require('../middleware/awsS3'); 
const { findOneAndUpdate } = require('../models/userModel');

const signUp = async (req, res) => {
    try{
        let data = req.body;
        let file = req.files;
        if(!Object.keys(data).length > 0) return res.status(400).json({status: false, message: 'Please enter User details'});
        let {fname, lname, email, password, phone, address} = data;

        if(!fname)    return res.status(400).json({status: false, message: `Please enter User's first name`});
        if(!lname)    return res.status(400).json({status: false, message: `Please enter User's last name`});
        if(!email)    return res.status(400).json({status: false, message: `Please enter User's email address`});
        if(!password) return res.status(400).json({status: false, message: `Please enter User's password`});
        if(!phone)    return res.status(400).json({status: false, message: `Please enter User's phone number`});
        if(!address)  return res.status(400).json({status: false, message: `Please enter User's address`});

        if(!isValidName(fname))  return res.status(400).json({status: false, message: `Please enter a valid first name`});
        if(!isValidName(lname))  return res.status(400).json({status: false, message: `Please enter a valid last name`});
        if(!isValidEmail(email)) return res.status(400).json({status: false, message: `Please enter a valid email address`});
        if(!isValidPassword(password)) return res.status(400).json({status: false, message: `Password Should be 8-15 characters which contains at least one numeric digit, one uppercase and one special character`});
        if(!isValidPhone(phone)) return res.status(400).json({status: false, message: `Please enter a valid phone number`});

        if(address){
            let parsed = JSON.parse(data.address);
            address = parsed;
            data.address = address;
        }else{
            return res.status(400).json({status: false, message: `Please enter address`});
        }

        let {shipping, billing} = address;
        if(!shipping) return res.status(400).json({status: false, message: `Please enter shipping address`});
        if(!billing) return res.status(400).json({status: false, message: `Please enter billing address`});

        // if(!isValidName(shipping.street)) return res.status(400).json({status: false, message: `Please enter valid shipping street`});
        if(!isValidName(shipping.city)) return res.status(400).json({status: false, message: `Please enter valid shipping city`});
        if(!isValidPincode(shipping.pincode)) return res.status(400).json({status: false, message: `Please enter valid shipping pincode`});

        // if(!isValidName(billing.street)) return res.status(400).json({status: false, message: `Please enter valid billing street`});
        if(!isValidName(billing.city)) return res.status(400).json({status: false, message: `Please enter valid billing city`});
        if(!isValidPincode(billing.pincode)) return res.status(400).json({status: false, message: `Please enter valid billing pincode`});

        let hashPassword = bcrypt.hashSync(password, 10);
        data['password'] = hashPassword;

        const isUniqueEmail =await userModel.findOne({email});
        if(isUniqueEmail) return res.status(400).json({status: false, message: `This email is already registered`});
        const isUniquePhone = await userModel.findOne({phone});
        if(isUniquePhone) return res.status(400).json({status: false, message: `This phone is already registered`});

        if(file && file.length > 0){
            // if(isValidFile) return res.status(200).json({status: false, message: `Please upload gif|jpeg|jpg|png|webp|bmp format file only`});
            let image = await uploadFile(file[0]);
            data['profileImage'] = image;
        }else{
            return res.status(400).json({status: false, message: `No image is selected`});
        }

        let userData = await userModel.create(data);
        res.status(201).json({status: true, message: 'Sign Up Successfull', data: userData});
    }
    catch(err){
        console.log(err)
        res.status(500).json({status: false, message: err.message});
    }
}

const signIn = async (req, res) => {
    try{
        const credentials = req.body;
        let { email, password } = credentials;

        if(!email) return res.status(400).json({status: false, message: `Email id is required`});
        if(!password) return res.status(400).json({status: false, message: `Password is required`});

        let userData = await userModel.findOne({email});
        if(!userData) return res.status(400).json({status: false, message: `User does not exist`});

        let passwordEn = bcrypt.compareSync(password, userData.password);
        if(!passwordEn) return res.status(401).json({status: false, message: `Invalid password`});

        let token = jwt.sign(
            {userId: userData._id.toString()},
            "SecreteValue",
            {expiresIn: '60min'}
        );
        res.setHeader('Authorization', 'Bearer ' + token);
        return res.status(200).json({status: true, message: `Successfully signed in`, data: {userId: userData._id, token: token}});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
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
        let userId = req.params.userId
        let data = req.body;
        if(Object.keys(data).length < 1 ) return res.status(400).json({status: false, message: 'Please enter User details to update profile'});
        let {fname, lname, email, password, phone, address} = data;

        if(fname){
            if(!isValidName(fname))  return res.status(400).json({status: false, message: `Please enter a valid first name`});
        }
        if(lname){
            if(!isValidName(lname))  return res.status(400).json({status: false, message: `Please enter a valid last name`});
        }
        if(email){
            if(!isValidEmail(email)) return res.status(400).json({status: false, message: `Please enter a valid email address`});
            const isUniqueEmail =await userModel.findOne({email});
            if(isUniqueEmail) return res.status(400).json({status: false, message: `This email is already registered`});
        }
        if(password){
            if(!isValidPassword(password)) return res.status(400).json({status: false, message: `Password Should be 8-15 characters which contains at least one numeric digit, one uppercase and one special character`});
            let hashPassword = bcrypt.hashSync(password, 10);
             data['password'] = hashPassword;
        }
        if(phone){
            if(!isValidPhone(phone)) return res.status(400).json({status: false, message: `Please enter a valid phone number`});
        }
        if(address){
            let parsed = JSON.parse(data.address);
            address = parsed;
            data.address = address;
        
            let {shipping, billing} = address;
            if(shipping){
                // if(!isValidName(shipping.street)) return res.status(400).json({status: false, message: `Please enter valid shipping street`});
                if(!isValidName(shipping.city)) return res.status(400).json({status: false, message: `Please enter valid shipping city`});
                if(!isValidPincode(shipping.pincode)) return res.status(400).json({status: false, message: `Please enter valid shipping pincode`});
            }
            if(billing){
                // if(!isValidName(billing.street)) return res.status(400).json({status: false, message: `Please enter valid billing street`});
                if(!isValidName(billing.city)) return res.status(400).json({status: false, message: `Please enter valid billing city`});
                if(!isValidPincode(billing.pincode)) return res.status(400).json({status: false, message: `Please enter valid billing pincode`});
            }
        }
        if(req.files){
            let file = req.files;
            if(file && file.length > 0){
                // if(isValidFile) return res.status(200).json({status: false, message: `Please upload gif|jpeg|jpg|png|webp|bmp format file only`});
                let image = await uploadFile(file[0]);
                data['profileImage'] = image;
            }
        }
        let updateProfile = await userModel.findOneAndUpdate({_id: userId}, data, {new: true});
        res.status(200).json({status: true, message: 'Profile Updated', data: updateProfile});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {signUp, signIn, getProfile, updateProfile};
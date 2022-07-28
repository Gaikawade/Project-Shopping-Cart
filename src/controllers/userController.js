const {isValidObjectId} = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userModel = require('../models/userModel');
const {isValid, isValidName, isValidEmail, isValidPassword, isValidPhone, isValidPincode, isValidFile} = require('../validation/validator');
const {uploadFile} = require('../aws/awsS3'); 

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
            address = JSON.parse(data.address);
            data[`address`] = address;
        }else{
            return res.status(400).json({status: false, message: `Please enter address`});
        }

        let {shipping, billing} = address;
        if(!shipping) return res.status(400).json({status: false, message: `Please enter shipping address`});
        if(!billing) return res.status(400).json({status: false, message: `Please enter billing address`});

        if(!isValid(shipping.street)) return res.status(400).json({status: false, message: `Please enter valid shipping street`});
        if(!isValidName(shipping.city)) return res.status(400).json({status: false, message: `Please enter valid shipping city`});
        if(!isValidPincode(shipping.pincode)) return res.status(400).json({status: false, message: `Please enter valid shipping pincode`});

        if(!isValid(billing.street)) return res.status(400).json({status: false, message: `Please enter valid billing street`});
        if(!isValidName(billing.city)) return res.status(400).json({status: false, message: `Please enter valid billing city`});
        if(!isValidPincode(billing.pincode)) return res.status(400).json({status: false, message: `Please enter valid billing pincode`});

        let hashPassword = bcrypt.hashSync(password, 10);
        data['password'] = hashPassword;

        const isUniqueEmail =await userModel.findOne({email});
        if(isUniqueEmail) return res.status(400).json({status: false, message: `This email is already registered`});
        const isUniquePhone = await userModel.findOne({phone});
        if(isUniquePhone) return res.status(400).json({status: false, message: `This phone is already registered`});

        if(file && file.length > 0){
            if(!isValidFile(file[0].mimetype)) return res.status(200).json({status: false, message: `Please upload jpg|jpeg|gif|png|webp|bmp format file only`});
            let imageURL = await uploadFile(file[0]);
            data['profileImage'] = imageURL;
        }else{
            return res.status(400).json({status: false, message: `No image is selected`});
        }

        let userData = await userModel.create(data);
        res.status(201).json({status: true, message: 'Successfully Signed Up', data: userData});
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
            {userId: userData._id.toString()},  //? Payload
            "SecreteValue",                     //? Secret Key
            {expiresIn: '60min'}                //? Expiration
        );
        res.setHeader(`Authorization`, token);
        return res.status(200).json({status: true, message: `Successfully signed in`, data: {userId: userData._id, token: token}});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const getProfile = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: 'User Id is not valid'});

        const user = await userModel.findOne({_id: userId});
        if(!user) return res.status(404).json({status: false, message: 'User not found'});
        if(!req.userId == userData._id) return res.status(400).json({status: false, message: 'You are not authorize'});

        res.status(200).json({status: true, message: 'User Profile Details', data: user});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const updateProfile = async (req, res) => {
    try{
        let userId = req.params.userId
        let data = req.body;
        let files = req.files;
        if(!Object.keys(data).length && !req.files) return res.status(400).json({status: false, message: 'Please enter User details to update profile'});

        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Please enter a valid User ID`});
        let userData = await userModel.findOne({_id: userId});

        if(!req.userId == userData._id) return res.status(400).json({status: false, message: 'You are not authorize'});
        if(!userData) return res.status(404).json({status: false, message: 'No user found with that id'});

        let {fname, lname, email, password, phone, address, profileImage} = data;

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
            let oldPassword = await bcrypt.compare(password, userData.password)
            if(password == oldPassword) return res.status(400).json({status: false, message: 'Please enter a new password which is different from the old password'});
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
                let {street, city, pincode} = shipping;
                if(street){
                    if(!isValid(street)) return res.status(400).json({status: false, message: `Please enter valid shipping street`});
                    newAddress.shipping.street = street;
                }
                if(city){
                    if(!isValidName(city)) return res.status(400).json({status: false, message: `Please enter valid shipping city`});
                    newAddress.shipping.city = city;
                }
                if(pincode){
                    if(!isValidPincode(pincode)) return res.status(400).json({status: false, message: `Please enter valid shipping pincode`});
                    newAddress.shipping.pincode = pincode;
                }
            }
            if(billing){
                let {street, city, pincode} = billing;
                if(street){
                    if(!isValid(street)) return res.status(400).json({status: false, message: `Please enter valid billing street`});
                    newAddress.billing.street = street;
                }
                if(city){
                    if(!isValidName(city)) return res.status(400).json({status: false, message: `Please enter valid billing city`});
                    newAddress.billing.city = city;
                }
                if(pincode){
                    if(!isValidPincode(pincode)) return res.status(400).json({status: false, message: `Please enter valid billing pincode`});
                    newAddress.billing.pincode = pincode;
                }
            }
            data['address'] = newAddress;
        }

        if(files.length > 0){
            if(isValidFile(files[0])) return res.status(200).json({status: false, message: `Please upload gif|jpeg|jpg|png|webp|bmp format file only`});
            let imageURL = await uploadFile(files[0]);
            data['profileImage'] = imageURL;
        }

        let updateProfile = await userModel.findOneAndUpdate({_id: userId}, {$set: {...data}}, {new: true});
        res.status(200).json({status: true, message: 'Profile Updated', data: updateProfile});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {signUp, signIn, getProfile, updateProfile};
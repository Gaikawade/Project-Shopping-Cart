const { isValidObjectId } = require('mongoose');

const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

const createCart = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const updateCart = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const getCart = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User does not exist`});
        if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: 'You are not authorize'});

        let cartData = await cartModel.findOne({userId});
        if(!cartData) return res.status(404).json({status: false, message: 'Cart does not exist'});
        res.status(200).json({status: true, message: 'Cart details', data: cartData});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const deleteCart = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User does not exist`});
        if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: 'You are not authorize'});

        let cartData = await cartModel.findOne({userId});
        if(!cartData) return res.status(404).json({status: false, message: 'Cart does not exist'});
        if(cartData.totalPrice == 0) return res.status(404).json({status: false, message: 'Your cart is empty'});

        let deletion = await cartModel.findOneAndUpdate({userId}, {$set: {items: [], totalPrice: 0, totalItems: 0}});
        res.status(204).json({status: false, message: 'Cart deleted successfully', data: deletion});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {createCart, updateCart, getCart, deleteCart};
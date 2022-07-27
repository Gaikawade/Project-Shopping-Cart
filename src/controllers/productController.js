const {isValidObjectId} = require('mongoose');
const productModel = require('../models/productModel');

const listing = async (req, res) => {
    try{

    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const productByFilter = async (req, res) => {
    try{

    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const productById = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(isValidObjectId(_id)) return res.status(400).json({status: false, message: 'Please enter a valid Product ID'})
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const updateListing = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(isValidObjectId(_id)) return res.status(400).json({status: false, message: 'Please enter a valid Product ID'})
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const deleteListing = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(isValidObjectId(_id)) return res.status(400).json({status: false, message: 'Please enter a valid Product ID'})
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = { listing, productByFilter, productById, updateListing, deleteListing }
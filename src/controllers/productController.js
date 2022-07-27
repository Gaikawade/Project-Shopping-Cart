const {isValidObjectId} = require('mongoose');
const productModel = require('../models/productModel');
const {uploadFile} = require('../aws/awsS3');
const {isValid, isValidText, isValidFile} = require('../validation/validator');

const listing = async (req, res) => {
    try{
        let data = req.body;
        if(Object.keys(data).length == 0) return res.status(400).json({status: false, message: 'Please provide data to listing a product'});
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = data;

        if(!title) return res.status(400).json({status: false, message: 'Title must be provided'});
        if(!description) return res.status(400).json({status: false, message: 'Description must be provided'});
        if(!price) return res.status(400).json({status: false, message: 'Price must be provided'});
        if(!availableSizes) return res.status(400).json({status: false, message: 'AvailableSizes must be provided'});

        if(!isValid(title)) return res.status(400).json({status: false, message: `This is not a valid Title`});
        if(!isValidText(title)) return res.status(400).json({status: false, message: `Please provide a valid Title for the product`});
        let isUniqueTitle = await productModel.findOne({title});
        if(isUniqueTitle) return res.status(200).json({status: false, message: `This title is already being used`});

        if(!isValid(description)) return res.status(400).json({status: false, message: `This is not a valid Description`});

        if(!/^\d+(?:\.\d{1,2})?$/.test(price)) return res.status(400).json({status: false, message: `Please enter a valid listing price`});

        if(currencyId){
            currencyId = currencyId.trim().toUpperCase();
            if(currencyId !== "INR") return res.status(400).json({status: false, message: `Currency Id must be in 'INR' only`});
        }else{
            data[`currencyId`] = "INR";
        }

        if(currencyFormat){
            if(currencyFormat !== "₹") return res.status(400).json({status: false, message: `Currency Format must be in '₹' only`});
        }else{
            data[`currencyFormat`] = "₹";
        }

        if(isFreeShipping){
            if(!['true', 'false'].includes(isFreeShipping)) return res.status(400).json({status: false, message: `isFreeShipping is either true or false`});
        }

        if(style || style == ''){
            if(!isValidText(style)) return res.status(400).json({status: false, message: `Style key only accepts alpha characters`});
        }

        let listedSizes = ['S', 'XS', 'M', 'L', 'X', 'XL', 'XXL'];
        let givenSizes = availableSizes.toUpperCase().split(',').map(x => x.trim());
        for(let i in givenSizes){
            if(!listedSizes.includes(givenSizes[i]))
                return res.status(400).json({status: false, message: `Sizes must include ${listedSizes}`});
        }
        data[`availableSizes`] = givenSizes;

        if(installments || installments === ''){
            if(!isValid(installments)) return res.status(400).json({status: false, message: 'Installments field cant be empty'}); 
            if(isNaN(installments)) return res.status(400).json({status: false, message: 'Installments should be a number'});
            if( installments > 0 ){
                if(installments % 1 != 0) return res.status(400).json({status: false, message: 'Please enter number of Installments without decimal points'});
            }
            else return res.status(400).json({status: false, message: `Installments must be a positive number`});
        }

        let file = req.files;
        if(file && file.length > 0){
            // if(!isValidFile(file[0])) return res.status(400).json({status: false, message: 'Please upload jpg|jpeg|gif|png|webp|bmp format file only'});
            let imageURL = await uploadFile(file[0]);
            console.log(imageURL)
            data[`productImage`] = imageURL;
        }else{
            return res.status(400).json({status: false, message: `No image is selected`});
        }

        let listedProduct = await productModel.create(data);
        res.status(201).json({status: true, message: `Product Listed Successfully`, data: listedProduct});
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
        if(!isValidObjectId(_id)) return res.status(400).json({status: false, message: 'Please enter a valid Product ID'});
        
        const product = await productModel.findOneAndUpdate({ _id: _id, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (!product) {
            return res.status(200).send({ status: true, message: "Product is already deleted " })
        }
        res.status(200).send({ status: true, message: "Product is deleted sucessfully" })
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = { listing, productByFilter, productById, updateListing, deleteListing }
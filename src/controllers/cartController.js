const { isValidObjectId } = require(`mongoose`);

const cartModel = require(`../models/cartModel`);
const userModel = require(`../models/userModel`);
const productModel = require(`../models/productModel`);
const { isValid } = require(`../middleware/validator`);

const createCart = async (req, res) => {
    try{
        const userId = req.params.userId;

        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid User id`});
        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User not found`});

        if(req.userId !== userData._id.toString()) return res.status(400).json({status: false, message: `Unauthorized Access`});

        let body = req.body
        if(Object.keys(body).length == 0) return res.status(400).json({status: false, message: `Please provide some data to create your cart`});
        let {productId, quantity} = body;

        if(Object.hasOwnProperty.bind(body)(`productId`)){
            if(!isValid(productId) || !isValidObjectId(productId)) return res.status(400).json({status: false, message: `Please provide a valid product ID`});
        }else{
            return res.status(400).json({status: false, message: `Product must be provided in order to be created`});
        }
        if(Object.hasOwnProperty.bind(body)(`quantity`)){
            if(isNaN(quantity)) return res.status(200).json({status: false, message: `Quantity must be a number`});
            if(quantity <= 0) return res.status(400).json({status: false, message: `Quantity must be greater than zero`});
        }else quantity = 1;

        let productData = await productModel.findOne({_id: productId, isDeleted: false});
        if(!productData) return res.status(404).json({status: false, message: `Product not found`});

        let cartData = await cartModel.findOne({userId});
        if(!cartData){
            let data = {
                userId: userId,
                items: [{productId: productId, quantity: quantity}],
                totalPrice: productData.price * quantity,
                totalItems: 1
            };
            let createCart = await cartModel.create(data);
            return res.status(201).json({status: true, message: `Cart created successfully`, data: createCart});
        }
        else{
            let totalPrice = cartData.totalPrice + (quantity * productData.price);
            totalPrice = totalPrice.toFixed(2);
            let items = cartData.items;
            for(i=0; i<items.length; i++){
                if(items[i].productId.toString() == productId){
                    items[i].quantity +=quantity;
                    let updateCartData = {items: items, totalPrice, totalItems: items.length};
                    let updatedCart = await cartModel.findOneAndUpdate({_id: cartData._id}, updateCartData, {new: true});
                    return res.status(200).json({status: true, message:`Product added successfully`, data: updatedCart});
                }
            }
            items.push({productId: productId, quantity: quantity});
            let updateCartData = {items: items, totalPrice, totalItems: items.length};
            let updatedCart = await cartModel.findOneAndUpdate({_id: cartData._id}, updateCartData, {new: true});
            return res.status(200).json({status: true, message: `Product added successfully`, data: updatedCart});
        }
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const updateCart = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User does not exist`});
        if(req.userId !== userData._id.toString()) return res.status(400).json({status: false, mesfsage: `You are not authorize`});

        let body = req.body
        if(Object.keys(body).length == 0) return res.status(400).json({status: false, message: `Please provide some data to create your cart`});
        let {productId, removeProduct} = body;

        if(Object.hasOwnProperty.bind(body)(`productId`)){
            if(!isValid(productId) || !isValidObjectId(productId)) return res.status(400).json({status: false, message: `Please provide a valid product ID`});
        }else{
            return res.status(400).json({status: false, message: `Product must be provided in order to be remove from the cart`});
        }
        if(Object.hasOwnProperty.bind(body)(`removeProduct`)){
            if(isNaN(removeProduct)) return res.status(200).json({status: false, message: `Quantity must be a number`});
            if(![0,-1].includes(removeProduct)) return res.status(400).json({status: false, message: `Quantity must be zero or -1`});
        }else{
            return res.status(400).json({status: false, message: `Quantity must be provided in order to be remove from the cart`});
        }

        let cartData = await cartModel.findOne({userId});
        if(!cartData) return res.status(404).json({status: false, message: `Cart does not exist`});

        let productData = await productModel.findOne({_id: productId, isDeleted: false});
        if(!productData) return res.status(404).json({status: false, message: `Product not found`});

        let productExists = await cartModel.findOne({items: {$elemMatch: {productId}}});
        if(!productExists) return res.status(404).json({status: false, message: `No such Product found in your cart`});

        if(removeProduct == 0){
            let findQuantity = cartData.items.find(x => x.productId.toString() == productId);
            let totalPrice = cartData.totalPrice - (productData.price * findQuantity.quantity);
            totalPrice = totalPrice.toFixed(2);
            let updateCart = await cartModel.findOneAndUpdate(
                {userId},
                {$pull: {items: {productId}}, $set: {totalPrice}, $inc: {totalItems: -1}},
                {new: true}
            );
            return res.status(200).json({status: true, message: `Product has been removed from the Cart`, data: updateCart});
        }
        else{
            let totalPrice = cartData.totalPrice - productData.price;
            totalPrice = totalPrice.toFixed(2);
            let items = cartData.items;
            for(i=0; i<items.length; i++){
                if(items[i].productId.toString() == productId){
                    items[i].quantity -= 1;
                    if(items[i].quantity == 0){
                        let updateCart = await cartModel.findOneAndUpdate(
                            {userId},
                            {$pull: {items: {productId}}, $set: {totalPrice}, $inc: {totalItems: -1}},
                            {new: true}
                        );
                        return res.status(200).json({status: true, message: `Product has been removed from the Cart`, data: updateCart});
                    }
                }
            }
            let updateCart = await cartModel.findOneAndUpdate({userId},{$set: {totalPrice, items}}, {new: true});
            return res.status(200).json({status: true, message: `Product Quantity has been updated successfully`, data: updateCart}); 
        }
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
        if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: `You are not authorize`});

        let cartData = await cartModel.findOne({userId});
        if(!cartData) return res.status(404).json({status: false, message: `Cart does not exist`});
        res.status(200).json({status: true, message: `Cart details`, data: cartData});
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
        if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: `You are not authorize`});

        let cartData = await cartModel.findOne({userId});
        if(!cartData) return res.status(404).json({status: false, message: `Cart does not exist`});
        if(cartData.totalPrice == 0) return res.status(404).json({status: false, message: `Your cart is empty`});

        let deletion = await cartModel.findOneAndUpdate({userId}, {$set: {items: [], totalPrice: 0, totalItems: 0}});
        res.status(204).json({status: false, message: `Cart deleted successfully`, data: deletion});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {createCart, updateCart, getCart, deleteCart};
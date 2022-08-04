const {isValidObjectId} = require(`mongoose`);

const userModel = require(`../models/userModel`);
const cartModel = require(`../models/cartModel`);
const orderModel = require(`../models/orderModel`);

const isBoolean = ['true', 'false'];

const createOrder = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Please enter a valid userId`});

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User not found`});
        // if(req.userId !== userId) return res.status(404).json({status: false, message: `You are not authorized to access this page`});

        let data = req.body;
        if(Object.keys(data).length <= 0) return res.status(400).json({status: false, message: `Please provide some information about your cart`});
        let {cartId, status, cancellable} = data;

        if(Object.hasOwnProperty.bind(data)(`cartId`)){
            if(!isValidObjectId(cartId)) return res.status(400).json({status: false, message: `Please enter a valid cart ID`});
        }
        if(Object.hasOwnProperty.bind(data)(`status`)){
            if(!['pending', 'complete', 'cancelled'].includes(status)) return res.status(400).json({status: false, message: `status can accept only pending, complete and cancelled`}); 
        }
        if(Object.hasOwnProperty.bind(data)(`cancellable`)){
            if(!isBoolean.includes(cancellable)) return res.status(400).json({status: false, message: `Cancellable should be true or false`});
        }

        let cartData = await cartModel.findOne({_id: cartId})
        if(!cartData) return res.status(404).json({status: false, message: `You have't added any products to your cart`});

        let quantity = 0;
        for(let i in cartData.items) quantity += cartData.items[i].quantity;

        let orderDetails = {
            userId: userId,
            items: cartData.items,
            totalPrice: cartData.totalPrice,
            totalItems: cartData.totalItems,
            totalQuantity: quantity,
            status: status,
            cancellable: cancellable
        }
        let orderPlaced = await orderModel.create(orderDetails);
        return res.status(201).json({status: false, message: `Order placed successfully`, data: orderPlaced});
    }
    catch(err){
        res.status(500).send({status: false, message: err.message});
    }
}

const updateOrder = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Please enter a valid userId`});

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User not found`});

        if(req.userId !== userId) return res.status(404).json({status: false, message: `You are not authorized to access this page`});

        let orderData = await orderModel.findOne({userId})
        if(!orderData) return res.status(404).json({status: false, message: `You have't placed any order`});
    }
    catch(err){
        res.status(500).send({status: false, message: err.message});
    }
}

module.exports = {createOrder, updateOrder};
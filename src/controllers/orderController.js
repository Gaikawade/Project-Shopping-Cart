const {isValidObjectId} = require(`mongoose`);

const userModel = require(`../models/userModel`);
const cartModel = require(`../models/cartModel`);
const orderModel = require(`../models/orderModel`);

const isBoolean = ['true', 'false'];
const statusEnum = ['pending', 'completed', 'cancelled'];

const createOrder = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Please enter a valid userId`});

        let data = req.body;
        if(Object.keys(data).length <= 0) return res.status(400).json({status: false, message: `Please provide some information about your cart`});
        let {cartId, status, cancellable} = data;

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User not found`});
        if(req.userId !== userId) return res.status(404).json({status: false, message: `You are not authorized to access this page`});

        if(Object.hasOwnProperty.bind(data)(`cartId`)){
            if(!isValidObjectId(cartId)) return res.status(400).json({status: false, message: `Please enter a valid cart ID`});
        }
        if(Object.hasOwnProperty.bind(data)(`status`)){
            status = status.toLowerCase();
            if(!status == 'pending') return res.status(400).json({status: false, message: `Status of the order must be in pending state while placing the order`}); 
        }
        if(Object.hasOwnProperty.bind(data)(`cancellable`)){
            cancellable = cancellable.toLowerCase();
            if(!isBoolean.includes(cancellable)) return res.status(400).json({status: false, message: `Cancellable should be true or false`});
        }

        let cartData = await cartModel.findOne({_id: cartId})
        if(!cartData) return res.status(404).json({status: false, message: `You have't added any products to your cart`});

        let orderDetails = {
            userId: userId,
            items: cartData.items,
            totalPrice: cartData.totalPrice,
            totalItems: cartData.totalItems,
            totalQuantity: cartData.items.reduce((x,y) => {return x + y.quantity}, 0),
            status: status,
            cancellable: cancellable
        }
        let orderPlaced = await orderModel.create(orderDetails);
        await cartModel.findOneAndUpdate(cartId, {items: [], totalPrice: 0,totalItems: 0});
        return res.status(201).json({status: true, message: `Order placed successfully`, data: orderPlaced});
    }
    catch(err){
        console.log(err)
        res.status(500).send({status: false, message: err.message});
    }
}

const updateOrder = async (req, res) => {
    try{
        let userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Please enter a valid userId`});

        let data = req.body;
        if(Object.keys(data).length <= 0) return res.status(400).json({status: false, message: `Please provide some information about your cart`});
        let {orderId, status} = data;

        let userData = await userModel.findById(userId);
        if(!userData) return res.status(404).json({status: false, message: `User not found`});

        if(req.userId !== userId) return res.status(404).json({status: false, message: `You are not authorized to access this page`});

        if(Object.hasOwnProperty.bind(data)(`orderId`)){
            if(!isValidObjectId(orderId)) return res.status(400).json({status: false, message: `Please enter a valid order ID`});
        }else{
            return res.status(400).json({status: false, message: `Please provide your order ID`});
        }
        let orderData = await orderModel.findOne({_id: orderId})
        if(!orderData) return res.status(404).json({status: false, message: `You have't placed any order`});

        if(Object.hasOwnProperty.bind(data)('status')){
            if(!statusEnum.includes(status)) return res.status(400).json({status: false, message: `Status should accept only - ${statusEnum}`});
        }else{
             return res.status(400).json({status: false, message: `Please confirm whether your order is completed or cancelled`});
        }
        
        if(status == 'pending'){
            if(orderData.status == 'completed') return res.status(400).json({status: false, message: `Order can't be updated to pending, because it is already completed`});
            if(orderData.status == 'cancelled') return res.status(400).json({status: false, message: `Order can't be updated to pending, because it is already cancelled`});
            if(orderData.status == 'pending') return res.status(400).json({status: false, message: `Your Order is still in pending state`});
        }
        if(status == 'completed'){
            if(orderData.status == 'cancelled') return res.status(400).json({status: false, message: `Order can't be updated to complete, because it is already cancelled`});
            if(orderData.status == 'completed') return res.status(400).json({status: false, message: `Your Order is already completed`});
            await cartModel.findOneAndUpdate({userId},
                {$set: {items: [], totalPrice: 0, totalItems: 0, totalQuantity: 0, status}},
                {new: true}
            );
            let orderUpdate = await orderModel.findOneAndUpdate({_id: orderId},{$set: {status}}, {new: true});
            return res.status(200).json({status: true, message:`Order completed successfully`, data: orderUpdate});
        }
        if(status == 'cancelled'){
            if(orderData.cancellable == false) return res.status(400).json({status: false, message: `Order can't be cancelled, because products in your cart are not canacellable`});
            if(orderData.status == 'completed') return res.status(400).json({status: false, message: `Order can't be cancelled, because it is already completed`});
            if(orderData.status == 'cancelled') return res.status(400).json({status: false, message: `Your order is already cancelled`});
            await cartModel.findOneAndUpdate({userId},
                {$set: {items: [], totalPrice: 0, totalItems: 0, totalQuantity: 0, status}},
                {new: true}
            );
            let orderUpdate = await orderModel.findOneAndUpdate({_id: orderId},{$set: {status}}, {new: true});
            return res.status(200).json({status: true, message: `Order cancelled successfully`, data: orderUpdate});
        }
    }
    catch(err){
        res.status(500).send({status: false, message: err.message});
    }
}

module.exports = {createOrder, updateOrder};
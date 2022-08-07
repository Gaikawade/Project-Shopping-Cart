const {isValidObjectId} = require(`mongoose`);
const productModel = require(`../models/productModel`);
const {uploadFile} = require(`../middleware/aws`);
const {isValid, isValidText, isValidFile} = require(`../middleware/validator`);

const listedSizes = ['S', 'XS', 'M', 'L', 'X', 'XL', 'XXL'];
const isBoolean = ['true', 'false'];

const listing = async (req, res) => {
    try{
        let data = req.body;
        if(Object.keys(data).length == 0 && !req.files) return res.status(400).json({status: false, message: `Please provide data to listing a product`});
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = data;

        if(!title) return res.status(400).json({status: false, message: `Title must be provided`});
        if(!description) return res.status(400).json({status: false, message: `Description must be provided`});
        if(!price) return res.status(400).json({status: false, message: `Price must be provided`});
        if(!availableSizes) return res.status(400).json({status: false, message: `AvailableSizes must be provided`});

        if(!isValid(title)) return res.status(400).json({status: false, message: `This is not a valid Title`});
        if(!isValidText(title)) return res.status(400).json({status: false, message: `Please provide a valid Title for the product`});
        let isUniqueTitle = await productModel.findOne({title});
        if(isUniqueTitle) return res.status(200).json({status: false, message: `This title is already being used`});

        if(!isValid(description)) return res.status(400).json({status: false, message: `This is not a valid Description`});

        if(!/^\d+(?:\.\d{1,2})?$/.test(price)) return res.status(400).json({status: false, message: `Please enter a valid listing price`});

        if(Object.hasOwnProperty.bind(data)(`currencyId`)){
            currencyId = currencyId.trim().toUpperCase();
            if(currencyId !== "INR") return res.status(400).json({status: false, message: `Currency Id must be in 'INR' only`});
            data[`currencyId`] = currencyId;
        }else{
            data[`currencyId`] = "INR";
        }

        if(Object.hasOwnProperty.bind(data)(`currencyFormat`)){
            if(currencyFormat !== "₹") return res.status(400).json({status: false, message: `Currency Format must be in '₹' only`});
        }else{
            data[`currencyFormat`] = "₹";
        }

        if(Object.hasOwnProperty.bind(data)(`isFreeShipping`)){
            if(!isBoolean.includes(isFreeShipping)) return res.status(400).json({status: false, message: `isFreeShipping is either true or false`});
        }

        if(Object.hasOwnProperty.bind(data)(`style`)){
            if(!isValidText(style)) return res.status(400).json({status: false, message: `Style key only accepts alpha characters and it can't be empty`});
        }

        let givenSizes = availableSizes.split(',').map(x => x.trim().toUpperCase());
        let check = givenSizes.every(x => listedSizes.some(y => x==y)); //*Instead of for-Loop we can use every-some functions
        if(check) data[`availableSizes`] =  givenSizes;
        else return res.status(400).json({status: false, message: `Available sizes must be of ${listedSizes}`});

        if(Object.hasOwnProperty.bind(data)(`installments`)){
            if(!isValid(installments)) return res.status(400).json({status: false, message: `Installments field cant be empty`}); 
            if(isNaN(installments)) return res.status(400).json({status: false, message: `Installments should be a number`});
            if( installments > 0 ){
                if(installments % 1 != 0) return res.status(400).json({status: false, message: `Please enter number of Installments without decimal points`});
            }
            else return res.status(400).json({status: false, message: `Installments must be a positive number`});
        }

        let file = req.files;
        if(file && file.length > 0){
            if(!isValidFile(file[0].mimetype)) return res.status(400).json({status: false, message: `Please upload jpg|jpeg|gif|png|webp|bmp format file only`});
            let imageURL = await uploadFile(file[0]);
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

const fetchByFilter = async (req, res) => {
    try{
        let data = req.query;
        let filter = { isDeleted: false };
        let {size, name, priceGreaterThan, priceLessThan, sortPrice} = data;

        if(isValid(size)){
            if(size){
                let givenSizes = size.split(',').map(x => x.trim().toUpperCase());
                let check = givenSizes.every(x => listedSizes.some(y => x==y)); //*Instead of using FOR Loop and INCLUDE Function
                if(check) filter[`availableSizes`] = {$in: givenSizes};
                else return res.status(400).json({status: false, message: `Available sizes must be of ${listedSizes}`});
            }
        }else if(size == ''){
            return res.status(400).json({status: false, message: `Size field can't be empty`});
        }

        if(isValid(name)){
            filter[`title`] = {$regex: name, $options: 'i'};
        }else if(name == ''){
            return res.status(400).json({status: false, message: `Name field can't be empty`});
        }

        if(Object.hasOwnProperty.bind(data)(`priceGreaterThan`)){
            if(!isValid(priceGreaterThan)) return res.status(400).json({status: false, message: `Price greater than field can't be empty`});
            if(isNaN(priceGreaterThan)) return res.status(400).json({status: false, message: `Please enter a valid price`});
            if(priceGreaterThan < 0) return res.status(400).json({status: false, message: `Price can't be less than zero`});
            filter[`price`] = {$gte: priceGreaterThan};
        }

        if(Object.hasOwnProperty.bind(data)(`priceLessThan`)){
            if(!isValid(priceLessThan)) return res.status(400).json({status: false, message: `Price less than field can't be empty`});
            if(isNaN(priceLessThan)) return res.status(400).json({status: false, message: `Please enter a valid price`});
            if(priceLessThan <= 0) return res.status(400).json({status: false, message: `Price can't be less than zero or zero`});
            if(priceGreaterThan) filter[`price`]= {$gte: priceGreaterThan, $lte: priceLessThan};
            else filter[`price`] = {$lte: priceLessThan};
        }
        
        if(Object.hasOwnProperty.bind(data)(`sortPrice`)){
            if(!['1','-1'].includes(sortPrice)) return res.status(400).json({status: false, message: `Sort price must be 1 or -1`});
            let products = await productModel.find(filter).sort({price: sortPrice});
            if(products.length == 0) return res.status(404).json({status: false, message: `No products found`});
            res.status(200).json({status: true, message: `Products List`, data: products});
        }
        else{
            let products = await productModel.find(filter);
            if(products.length == 0) return res.status(404).json({status: false, message: `No products found`});
            res.status(200).json({status: true, message: `Products List`, data: products});
        }
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const fetchById = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(!isValidObjectId(_id)) return res.status(400).json({status: false, message: `Please enter a valid Product ID`});

        let document = await productModel.findOne({_id, isdeleted: false});
        if(!document) return res.status(404).json({status: false, message: `Product not found`});

        res.status(200).json({status: true, message: `Product details`, data: document});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const updateListing = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(!_id) return res.status(400).json({status: false, message: `Please enter productId`});
        if(!isValidObjectId(_id)) return res.status(400).json({status: false, message: `Please enter a valid Product ID`});

        let data = req.body;
        let file = req.files;
        if(!Object.keys(data).length && !req.files) return res.status(400).json({status: false, message: `Please enter data to update the Listing`});
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = data;

        if(Object.hasOwnProperty.bind(data)(`title`)){
            if(!isValid(title)) return res.status(400).json({status: false, message: `This is not a valid Title`});
            if(!isValidText(title)) return res.status(400).json({status: false, message: `Please provide a valid Title for the product`});
            let isUniqueTitle = await productModel.findOne({title});
            if(isUniqueTitle) return res.status(200).json({status: false, message: `This title is already being used`});
        }
        if(Object.hasOwnProperty.bind(data)(`description`)){
            if(!isValid(description)) return res.status(400).json({status: false, message: `This is not a valid Description`});
        }
        if(Object.hasOwnProperty.bind(data)(`price`)){
            if(!/^\d+(?:\.\d{1,2})?$/.test(price)) return res.status(400).json({status: false, message: `Please enter a valid listing price`});
        }
        if(Object.hasOwnProperty.bind(data)(`currencyId`)){
            currencyId = currencyId.trim().toUpperCase();
            if(currencyId !== "INR") return res.status(400).json({status: false, message: `Currency Id must be in 'INR' only`});
        }
        if(Object.hasOwnProperty.bind(data)(`currencyFormat`)){
            if(currencyFormat !== "₹") return res.status(400).json({status: false, message: `Currency Format must be in '₹' only`});
        }
        if(Object.hasOwnProperty.bind(data)(`isFreeShipping`)){
            if(!isBoolean.includes(isFreeShipping)) return res.status(400).json({status: false, message: `isFreeShipping is either true or false`});
        }

        if(Object.hasOwnProperty.bind(data)(`style`)){
            if(!isValidText(style)) return res.status(400).json({status: false, message: `Style key only accepts alpha characters`});
        }

        if(Object.hasOwnProperty.bind(data)(`availableSizes`)){
            let givenSizes = availableSizes.split(',').map(x => x.trim().toUpperCase());
            if(givenSizes.every(x => listedSizes.some(y => x==y)))
                    return res.status(400).json({status: false, message: `Sizes must include ${listedSizes}`});
            data[`availableSizes`] = {$in: givenSizes};
        }

        if(Object.hasOwnProperty.bind(data)(`installments`)){
            if(!isValid(installments)) return res.status(400).json({status: false, message: `Installments field cant be empty`}); 
            if(isNaN(installments)) return res.status(400).json({status: false, message: `Installments should be a number`});
            if( installments > 0 ){
                if(installments % 1 != 0) return res.status(400).json({status: false, message: `Please enter number of Installments without decimal points`});
            }
            else return res.status(400).json({status: false, message: `Installments must be a positive number`});
        }

        if(file && file.length > 0){
            if(!isValidFile(file[0].mimetype)) return res.status(400).json({status: false, message: `Please upload jpg|jpeg|gif|png|webp|bmp format file only`});
            let imageURL = await uploadFile(file[0]);
            data[`productImage`] = imageURL;
        }

        let updateListing = await productModel.findOneAndUpdate({_id}, {$set: {...data}}, {new: true});
        if(!updateListing) return res.status(404).json({status: false, message: `Product not found`});
        res.status(200).json({status: true, message: `Product updated successful`, data: updateListing});
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

const deleteListing = async (req, res) => {
    try{
        const _id = req.params.productId;
        if(!isValidObjectId(_id)) return res.status(400).json({status: false, message: `Please enter a valid Product ID`});
        
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

module.exports = { listing, fetchByFilter, fetchById, updateListing, deleteListing }
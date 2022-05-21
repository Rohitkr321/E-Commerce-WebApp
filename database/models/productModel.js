const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true,
    },
    stock:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    }

})

const productModel = mongoose.model('product',productSchema);
module.exports = productModel;
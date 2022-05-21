const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    id:{
        type:String,
        required:true,

    },
    productName:{
        type:String,
        required:true,
    },
    image:{
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
    } ,   
    quantity:{
        type:Number,
        required:true,
        default:1
    }


},{timestamps:true})

const cartModel = mongoose.model('cart',cartSchema);
module.exports = cartModel;
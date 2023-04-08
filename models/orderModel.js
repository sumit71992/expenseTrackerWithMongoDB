const mongoose = require('mongoose');
const userModel = require('./userModel');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    paymentId:{
        type: String,
        required:true
    },
    orderId:{
        type: String,
        required:true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: userModel
    },
    status:{
        type: String,
        required:true
    }
});
module.exports = mongoose.model("Order",orderSchema);
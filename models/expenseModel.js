const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./userModel");

const expenseSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category:{
    type: String,
    required: true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: User
  }
  
},{timestamps: true});

module.exports = mongoose.model("Expense",expenseSchema);
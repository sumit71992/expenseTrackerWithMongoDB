const mongoose = require("mongoose");

const mongoConnect = () => {
  return mongoose.connect(
    "mongodb+srv://expense:kbickysingh@expensetracker.tbv9mcd.mongodb.net/expenseTracker?retryWrites=true&w=majority"
  );
};

module.exports = mongoConnect;
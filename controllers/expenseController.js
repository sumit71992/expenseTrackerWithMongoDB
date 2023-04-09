const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const S3Services = require("../services/s3Services");

exports.addExpense = async (req, res, next) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.user.id;
    const expense = await new Expense({
      amount,
      description,
      category,
      userId,
    }).save();
    const totalExpense = req.user.totalExpenses + Number(amount);
    await User.findByIdAndUpdate(userId, {
      totalExpenses: totalExpense,
    });
    console.log("Expense added successfully");
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};
exports.getAllExpenses = async (req, res, next) => {
  try {
    const str = req.query.page;
    const page = str ? Number(str.split("=")[0]) : 1;
    const ltd = str ? Number(str.split("=")[1]) : 10;
    let count = await Expense.count({ userId: req.user.id });
    const isPremium = req.user.isPremium;
    const expenses = await Expense.find({
      userId: req.user.id
    }).skip((page - 1) * ltd).limit(ltd);
    return res.status(200).json({
      expenses,
      isPremium,
      hasNextPage: ltd * page < count,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(count / ltd),
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findByIdAndDelete(id);
    const usr = await User.findById(req.user.id);
    usr.totalExpenses -= expense.amount;
    await usr.save();
    console.log("Expense deleted");
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};
exports.getEditExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id);
    return res.json({ expense });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};
exports.updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const expense = await Expense.findById(IDBOpenDBRequest);
    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    await expense.save();
    return res.json({ expense });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};
exports.getLeaderboard = async (req, res) => {
  try {
    const userLeaderboard = await User.find().sort({ totalExpenses: 'desc' });
    return res.json({ userLeaderboard });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Error: err, message: "Something went wrong" });
  }
};

exports.downloadExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${req.user.id}/${Date.now()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    return res.status(200).json({ fileURL, message: "Uploaded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err, message: "Something went wrong" });
  }
};

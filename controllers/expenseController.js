const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../util/database");
const UserServices = require("../services/userServices");
const S3Services = require("../services/s3Services");

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { amount, description, category } = req.body;
    const userId = req.user.id;
    await req.user.createExpense(
      {
        amount,
        description,
        category,
      },
      { transaction: t }
    );
    const totalExpense = req.user.totalExpenses + Number(amount);
    await User.update(
      {
        totalExpenses: totalExpense,
      },
      { where: { id: userId }, transaction: t }
    );
    await t.commit();
    next();
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};
exports.getAllExpenses = async (req, res, next) => {
  try {
    const str = req.query.page;
    const page = str ? Number(str.split("=")[0]) : 1;
    const ltd = str ? Number(str.split("=")[1]) : 10;
    let count = await Expense.count({ where: { userId: req.user.id } });
    const isPremium = req.user.isPremium;
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: (page - 1) * ltd,
      limit: ltd,
    });
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
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const expense = await Expense.findByPk(id, { transaction: t });
    const usr = await User.findByPk(req.user.id, { transaction: t });
    usr.totalExpenses -= expense.amount;
    await t.commit();
    await usr.save();
    await expense.destroy();
    next();
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).json({ err, message: "Something went wrong" });
  }
};
exports.getEditExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findByPk(id);
    return res.json({ expense });
  } catch (err) {
    console.log(err);
  }
};
exports.updateExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const expense = await Expense.findByPk(id, { transaction: t });
    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    await t.commit();
    await expense.save();
    return res.json({ expense });
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};
exports.getLeaderboard = async (req, res) => {
  try {
    const userLeaderboard = await User.findAll({
      attributes: ["name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]],
    });
    return res.json({ userLeaderboard });
  } catch (err) {
    console.log(err);
  }
};

exports.downloadExpense = async (req, res) => {
  try {
    const expenses = await UserServices.getExpenses(req);
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${req.user.id}/${Date.now()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    return res.status(200).json({ fileURL, message: "Uploaded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err, message: "Something went wrong" });
  }
};

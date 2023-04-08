const Razorpay = require("razorpay");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const premium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 5000;
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      await new Order({
        orderId: order.id,
        userId: req.user.id,
        status: "PENDING",
      }).save();
      console.log("Pending order generated");
      return res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log(err);
  }
};
const updateStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    const reason = req.body.reason;
    if (reason == "payment_failed") {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentId: payment_id,
          status: "FAILED",
        }
      );
      console.log("Payment failed");
      return res.status(202).json({ message: "Transaction Failed" });
    }

    await Order.findOneAndUpdate(
      { orderId: order_id },
      {
        paymentId: payment_id,
        status: "SUCCESSFUL",
      }
    );

    await User.findByIdAndUpdate(req.user.id, { isPremium: true });
    return res.status(202).json({ message: "Transaction Successful" });
  } catch (err) {
    console.log("err", err);
    return res
      .status(403)
      .json({ error: err, message: "Something went wrong" });
  }
};

module.exports = {
  premium: premium,
  updateStatus,
};

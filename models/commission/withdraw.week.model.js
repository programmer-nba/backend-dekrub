const mongoose = require("mongoose");
const Joi = require("joi");

const withdraw_week = new mongoose.Schema(
  {
    member_number: {type: String, required: true},
    amount: {type: Number, required: true},
    slip_img: {type: String},
    status: {
      type: [
        {
          status: {type: String},
          timestamp: {type: String},
        },
      ],
    },
    timestamp: {type: Date, default: Date.now()},
  },
  {timestamps: true}
);

const WithdrawWeeks = new mongoose.model("withdraw_CommissionWeek", withdraw_week);

module.exports = {WithdrawWeeks};

const mongoose = require("mongoose");
const Joi = require("joi");

const withdraw_day = new mongoose.Schema(
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
    timestamp: {type: String},
  },
  {timestamps: true}
);

const WithdrawDays = new mongoose.model("withdraw_CommissionDay", withdraw_day);

module.exports = {WithdrawDays};

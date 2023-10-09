const mongoose = require("mongoose");
const Joi = require("joi");

const BankSchema = new mongoose.Schema({
  member_number: {type: String, required: true},
  name: {type: String, required: true},
  picture: {type: String},
  status: {
    type: [
      {
        status: {type: String},
        timestamp: {type: String},
      },
    ],
  },
});

const ImageBank = mongoose.model("image_bank", BankSchema);

module.exports = {ImageBank};

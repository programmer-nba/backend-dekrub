const mongoose = require("mongoose");
const Joi = require("joi");

const IdenSchema = new mongoose.Schema({
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

const ImageIden = mongoose.model("image_iden", IdenSchema);

module.exports = {ImageIden};

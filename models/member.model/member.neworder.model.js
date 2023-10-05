const mongoose = require("mongoose");
const Joi = require("joi");

const MemberOrderNewSchema = new mongoose.Schema({
  receiptnumber: {type: String, required: true},
  member_number: {type: String, required: true},
  name: {type: String, required: true},
  amount: {type: Number, required: true},
  slip_img: [
    {
      type: String,
    },
  ],
  status: {
    type: [
      {
        status: {type: String},
        timestamp: {type: String},
      },
    ],
  },
  timestamp: {type: Date, required: true},
});

const NewOrderMembers = mongoose.model("member_neworder", MemberOrderNewSchema);

const validate = (data) => {
  const schema = Joi.object({
    member_number: Joi.string().required().label("ไม่พบเลข"),
    name: Joi.string().required().label("ไม่พบชื่อ"),
    amount: Joi.number().required().label("ไม่พบยอดราคา"),
    slip_img: Joi.string().default("-"),
    timestamp: Joi.date().required().label("ไม่มีวันที่สมัคร"),
  });
  return schema.validate(data);
};

module.exports = {NewOrderMembers, validate};

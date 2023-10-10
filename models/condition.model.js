const mongoose = require("mongoose");
const Joi = require("joi");

const ConditionSchema = new mongoose.Schema({
  member_number: {type: String, required: true},
  name: {type: String, required: true}, //ชื่อ
  tel: {type: String, required: true}, //เบอร์โทรศัพท์
  username: {type: String, required: true}, //username
  status: {type: String, required: true},
  timestamp: {type: Date, required: false, default: Date.now()}, //เริ่ม
});

const Condition = mongoose.model("condition", ConditionSchema);

module.exports = {Condition};

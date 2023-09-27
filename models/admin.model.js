const mongoose = require("mongoose");
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true}, //ชื่อ
  username: {type: String, required: true}, //username
  password: {type: String, required: true}, //password
  position: {type: String, required: true},
  status: {type: Boolean, required: false, default: false},
  date_start: { type: Date, required: false, default: Date.now() }, //เริ่ม
});

const Admins = mongoose.model("admin", UserSchema);

const validate = (data) => {
    const schema = Joi.object({
      name: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้ด้วย"),
      username: Joi.string().required().label("กรุณากรอกไอดีผู้ใช้ด้วย"),
      password : Joi.string().required().label('กรุณากรอกรหัสผู้ใช้ด้วย'),
      position: Joi.string().required().label("กรุณากรอกเลเวลผู้ใช้ด้วย"),
      status: Joi.boolean().default(true),
      date_start: Joi.date().raw().default(Date.now()),
    });
    return schema.validate(data);
  };

module.exports = {Admins, validate};

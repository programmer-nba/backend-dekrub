const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

const complexityOptions = {
  min: 6,
  max: 30,
  lowerCase: 0,
  upperCase: 0,
  numeric: 0,
  symbol: 0,
  requirementCount: 2,
};

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true}, //ชื่อ
  username: {type: String, required: true}, //username
  password: {type: String, required: true}, //password
  position: {type: String, required: true},
  status: {type: Boolean, required: false, default: false},
  date_start: { type: Date, required: false, default: Date.now() }, //เริ่ม
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {_id: this._id, name: this.admin_name, row: "admin"},
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "4h",
    }
  );
  return token;
};

const Admins = mongoose.model("user", UserSchema);

const validate = (data) => {
    const schema = Joi.object({
      name: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้ด้วย"),
      username: Joi.string().required().label("กรุณากรอกเลขบัตรผู้ใช้ด้วย"),
      password: passwordComplexity(complexityOptions)
        .required()
        .label("admin_password"),
      position: Joi.string().required().label("กรุณากรอกเลเวลผู้ใช้ด้วย"),
      status: Joi.boolean().default(true),
      date_start: Joi.date().raw().default(Date.now()),
    });
    return schema.validate(data);
  };

module.exports = {Admins, validate};

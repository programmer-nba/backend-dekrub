const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    username: {type: String, require: true},
    // ip_address: {type: String, required: true}, //ข้อมูลอ้างอิงการเข้าสู่ระบบ
    timestamp: {type: Date, required: true},
  },
  {timestamps: true}
);

const LoginHistory = mongoose.model("login_history", LoginHistorySchema);

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("ไม่พบไอดีผู้ใช้งาน"),
    // ip_address: Joi.string().required().label("ไม่พบไอพี"),
    timestamp: Joi.date().required().label("ไม่พบเวลาใช้งาน"),
  });
  return schema.validate(data);
};

module.exports = {LoginHistory, validate};

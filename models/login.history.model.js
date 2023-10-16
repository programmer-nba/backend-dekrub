const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    username: {type: String, require: true},
    timestamp: {type: String, required: true},
  },
  {timestamps: true}
);

const LoginHistory = mongoose.model("login_history", LoginHistorySchema);

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("ไม่พบไอดีผู้ใช้งาน"),
    timestamp: Joi.string().required().label("ไม่พบเวลาใช้งาน"),
  });
  return schema.validate(data);
};

module.exports = {LoginHistory, validate};

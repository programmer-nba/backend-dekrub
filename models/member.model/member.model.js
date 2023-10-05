const mongoose = require("mongoose");
const Joi = require("joi");

const MemberSchema = new mongoose.Schema({
  member_number: {type: String, required: true},
  name: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  tel: {type: String, required: true},
  address: {type: String, required: true},
  subdistrict: {type: String, required: true},
  district: {type: String, required: true},
  province: {type: String, required: true},
  commission_day: {type: Number},
  commission_week: {type: Number},
  bank: {
    name: {type: String, required: false, default: "-"},
    number: {type: String, required: false, default: "-"},
    image: {type: String, required: false, default: "-"},
    status: {type: Boolean, required: false, default: false},
    remark: {type: String, required: false, default: "-"}, // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
  },
  iden: {
    number: {type: String, required: false, default: "-"},
    image: {type: String, required: false, default: "-"},
    status: {type: Boolean, required: false, default: false},
    remark: {type: String, required: false, default: "-"}, // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
  },
  upline: {
    lv1: {type: String, required: false, default: "-"},
    lv2: {type: String, required: false, default: "-"},
  },
  position: {type: String, required: true},
  timestamp: {type: Date, required: true},
  status: {type: Boolean, required: false, default: false},
});

const Members = mongoose.model("member", MemberSchema);

const validate = (data) => {
  const schema = Joi.object({
    member_number: Joi.string().required().label("ไม่พบเลข"),
    name: Joi.string().required().label("ไม่พบชื่อ"),
    username: Joi.string().required().label("ไม่พบ user"),
    password : Joi.string().required().label('ไม่พบรหัสผ่าน'),
    tel: Joi.string().required().label("ไม่พบเบอร์โทรศัพท์"),
    address: Joi.string().required().label("ไม่พบที่อยู่"),
    subdistrict: Joi.string().required().label("ไม่พบตำบล"),
    district: Joi.string().required().label("ไม่พบ เขต/อำเภอ"),
    province: Joi.string().required().label("ไม่พบจังหวัด"),
    commission_day: Joi.number().default(0),
    commission_week: Joi.number().default(0),
    bank: {
      name: Joi.string().default("-"),
      number: Joi.string().default("-"),
      image: Joi.string().default("-"),
      status: Joi.boolean().default(false),
      remark: Joi.string().default("-"),
    },
    iden: {
      number: Joi.string().default("-"),
      image: Joi.string().default("-"),
      status: Joi.boolean().default(false),
      remark: Joi.string().default("-"),
    },
    upline: {
      lv1: Joi.string().default("-"),
      lv2: Joi.string().default("-"),
    },
    position: Joi.string().required().label("ไม่พบตำแหน่ง"),
    timestamp: Joi.date().required().label('ไม่มีวันที่สมัคร'),
    status: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = {Members, validate};

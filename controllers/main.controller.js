const {Admins} = require("../models/admin.model");
const {Members} = require("../models/member/member.model");
const {LoginHistory} = require("../models/login.history.model");
const {TokenList} = require("../models/token.list.model");
const token_decode = require("../lib/token_decode");
const {Commission_day} = require("../models/commission/commission.day.model");

const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
require("dotenv").config();

//Validate Register
const vali_register = (data) => {
  const schema = Joi.object({
    member_ref: Joi.string().default("กรุณากรอกรหัสผู้แนะนำ"),
    name: Joi.string().required().label("กรุณากรอกชื่อ-นามสกุล"),
    username: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้"),
    password: Joi.string().required().label("กรุณากรอกรหัสผ่าน"),
    tel: Joi.string().required().label("กรุณากรอกเบอร์โทร"),
    address: Joi.string().required().label("กรุณากรอกที่อยู่"),
    subdistrict: Joi.string().required().label("กรุณากรอกเขต/ตำบล"),
    district: Joi.string().required().label("กรุณากรอกเขต/อำเภอ"),
    province: Joi.string().required().label("กรุณากรอกจังหวัด"),
  });
  return schema.validate(data);
};

exports.register = async (req, res) => {
  try {
    const {error} = vali_register(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }
    const user = await Members.findOne({
      username: req.body.username,
    });
    if (user) {
      return res.status(409).send({
        status: false,
        message: "รหัสผู้ใช้นี้มีในระบบแล้ว",
      });
    }
    let data = null;
    const memberNumber = await Members.find();
    const count = memberNumber.length + 1;
    const member_number = `DK969${count.toString().padStart(8, "0")}`;
    const date = dayjs(Date.now()).format();
    const encrytedPassword = await bcrypt.hash(req.body.password, 10);
    //commission
    const commission = 150;
    //vat commission
    const vat = (commission * 3) / 100;
    //real commission
    const realcommission = commission - vat;
    if (req.body.username) {
      const memberRef = await Members.findOne({
        member_number: req.body.member_ref,
      });
      if (memberRef) {
        const upline = {
          lv1: memberRef.member_number,
          lv2: memberRef.upline.lv1,
        };
        data = {
          ...req.body,
          member_number: member_number,
          position: "member",
          password: encrytedPassword,
          upline: upline,
          timestamp: date,
        };
      } else {
        return res.status(400).send({
          status: false,
          message: "ไม่พบข้อมูลผู้แนะ",
        });
      }
    }
    const storeData = [];
    const integratedData = {
      member_number: req.body.member_ref,
      commission: commission,
      vat3percent: vat,
      remainding_commission: realcommission,
    };
    if (integratedData) {
      storeData.push(integratedData);
    }
    const commissionData = {
      data: storeData,
      from_member: member_number,
    };
    const commission_day = new Commission_day(commissionData);
    commission_day.save();
    //เพิ่มข้อมูลลงฐานข้อมูล
    const member = await Members.create(data);
    if (member) {
      const payload = {
        _id: member._id,
        auth: member.position,
        name: member.name,
      };
      const token = jwt.sign(payload, `${process.env.JWTPRIVATEKEY}`);
      await new LoginHistory({
        username: member.username,
        id_address: "register",
        timestamp: dayjs(Date.now()).format(),
      }).save();
      await new TokenList({
        id: member._id,
        token: token,
        timestamp: dayjs(Date.now()).format(),
      }).save();
      return res.status(200).send({status: true, message: "สมัครสมาชิกสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "สมัครสมาชิกไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.login = async (req, res) => {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      return res.status(400).send({message: error.details[0].message});
    }
    const admin = await Admins.findOne({username});
    if (!admin) {
      await checkMembers(req, res);
    } else {
      const validPasswordAdmin =
        admin && (await bcrypt.compare(password, admin.password));
      if (!validPasswordAdmin) {
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      }
      const payload = {
        _id: admin._id,
        auth: admin.position,
        name: admin.name,
        username: admin.username,
      };
      const token = jwt.sign(payload, `${process.env.JWTPRIVATEKEY}`);
      await new LoginHistory({
        username: admin.username,
        timestamp: dayjs(Date.now()).format(),
      }).save();
      await new TokenList({
        id: admin._id,
        token: token,
        timestamp: dayjs(Date.now()).format(),
      }).save();
      const ResponesData = {
        name: admin.name,
        username: admin.username,
        position: admin.position,
      };
      res.status(200).send({
        token: token,
        messahe: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "admin",
        status: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({message: "Internal Server Error"});
  }
};

exports.logout = async (req, res) => {
  try {
    const token = token_decode(req.headers["token"]);
    const logout = await TokenList.deleteMany({id: token._id});
    if (logout) {
      return res.status(200).send({status: true, message: "ออกจากระบบสำเร็จ"});
    } else {
      return res.status(400).send({
        status: false,
        message: "ออกจากระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

//เรียกข้อมูลมูลผู้ใช้
exports.me = async (req, res) => {
  try {
    const token = token_decode(req.headers["token"]);
    console.log(token);
    if (token.auth === "admin") {
      const admin = await Admins.findById(token._id);
      if (admin) {
        return res.status(200).send({status: true, data: admin});
      } else {
        return res
          .status(400)
          .send({status: false, message: "ไม่พบข้อมูลผู้ใช้นี้"});
      }
    } else {
      const member = await Members.findById(token._id);
      if (member) {
        return res.status(200).send({status: true, data: member});
      } else {
        return res
          .status(400)
          .send({status: false, message: "ไม่พบข้อมูลผู้ใช้นี้"});
      }
    }
  } catch (err) {
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

//แก้ไขหรือตั้งรหัสผ่านใหม่
exports.setPassword = async (req, res) => {
  try {
    const vali = (data) => {
      const schema = Joi.object({
        password: Joi.string().required().label("ไม่พบรหัสผ่านใหม่"),
      });
      return schema.validate(data);
    };
    const {error} = vali(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }
    const decode = token_decode(req.headers["token"]);
    const encrytedPassword = await bcrypt.hash(req.body.password, 10);
    const change_password = await Members.findByIdAndUpdate(decode._id, {
      password: encrytedPassword,
    });
    if (change_password) {
      return res
        .status(200)
        .send({status: true, message: "ทำการเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "เปลี่ยนรหัสผ่านไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

const checkMembers = async (req, res) => {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      return res.status(400).send({message: error.details[0].message});
    }
    const member = await Members.findOne({username});
    const validPasswordAdmin =
      member && (await bcrypt.compare(password, member.password));
    if (!validPasswordAdmin) {
      return res.status(401).send({
        message: "password is not find",
        status: false,
      });
    }
    const payload = {
      _id: member._id,
      auth: member.position,
      name: member.name,
      username: member.username,
    };
    const token = jwt.sign(payload, `${process.env.JWTPRIVATEKEY}`);
    await new LoginHistory({
      username: member.username,
      timestamp: dayjs(Date.now()).format(),
    }).save();
    await new TokenList({
      id: member._id,
      token: token,
      timestamp: dayjs(Date.now()).format(),
    }).save();
    const ResponesData = {
      card_number: member.card_number,
      name: member.name,
      username: member.username,
      tel: member.tel,
      bank: member.bank,
      iden: member.iden,
      upline: member.upline,
    };
    res.status(200).send({
      token: token,
      message: "เข้าสู่ระบบสำเร็จ",
      result: ResponesData,
      level: "member",
      status: true,
    });
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
};

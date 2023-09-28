const {Admins} = require("../models/admin.model");
const {Members} = require("../models/member.model");
const {LoginHistory} = require("../models/login.history.model");
const {TokenList} = require("../models/token.list.model");
const token_decode = require("../lib/token_decode");

const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
require("dotenv").config();

//Validate Register
const vali_register = (data) => {
  const schema = Joi.object({
    card_number: Joi.string().required(),
    name: Joi.string().required().label("กรุณากรอกชื่อ-นามสกุล"),
    username: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้"),
    password: Joi.string().required().label("กรุณากรอกรหัสผ่าน"),
    tel: Joi.string().required().label("กรุณากรอกเบอร์โทร"),
    address: Joi.string().required().label("กรุณากรอกที่อยู่"),
    subdistrict: Joi.string().required().label("กรุณากรอกเขต/ตำบล"),
    district: Joi.string().required().label("กรุณากรอกเขต/อำเภอ"),
    province: Joi.string().required().label("กรุณากรอกจังหวัด"),
    postcode: Joi.string().required().label("กรุณากรอกรหัสไปรษณีย์"),
    timestamp: Joi.string().required().label("ไม่พบเวลาที่สมัคร"),
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
    let data = null;
    // const card_number = `888888${req.body.ref_id}`;
    const encrytedPassword = await bcrypt.hash(req.body.password, 10);
    // if (req.body.username) {
    //   const memberRef = await Members.findOne({username: req.body.username});
    //   if (memberRef) {
    //     const upline = {
    //       lv1: memberRef._id,
    //       lv2: memberRef.upline.lv1,
    //     };
    //     data = {
    //       ...req.body,
    //       card_number: card_number,
    //       password: encrytedPassword,
    //       upline: upline,
    //     };
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message: "ไม่พบข้อมูลผู้แนะนำ",
    //     });
    //   }
    // } else {
    //   data = {
    //     ...req.body,
    //     card_number: card_number,
    //     password: encrytedPassword,
    //   };
    //   console.log("ไม่มีคนแนะนำ");
    // }

    //เพิ่มข้อมูลลงฐานข้อมูล

    data = {
      ...req.body,
      position: 'member',
      password: encrytedPassword,
    }
    
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
        id_address: 'register',
        timestamp: dayjs(Date.now()).format(),
      }).save();
      await new TokenList({
        username: member.username,
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
      };
      console.log(payload);
      const token = jwt.sign(payload, `${process.env.JWTPRIVATEKEY}`);
      await new LoginHistory({
        username: admin.username,
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

exports.me = async (req, res) => {
  const { decoded } = req;
  try {
    if ( decoded && decoded.auth === "admin"){
      const id = decoded._id;
      Admins.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            _id: item._id,
            name: item.name,
            username: item.username,
            position: item.position,
          })
        })
        .catch(() =>
          res.status(400).send({ message: "มีบางอย่างผิดพลาด", status: false })
        );
    }else if (decoded && decoded.auth === "member"){
      const id = decoded._id;
      Members.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            _id: item._id,
            name: item.name,
            username: item.username,
            position: item.position,
          })
        })
        .catch(() =>
          res.status(400).send({ message: "มีบางอย่างผิดพลาด", status: false })
        );
    }
  }catch (error) {
    res.status(500).send({ message: "Internal Server Error", status: false });
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
    };
    console.log(payload);
    const token = jwt.sign(payload, `${process.env.JWTPRIVATEKEY}`);
    await new LoginHistory({
      username: member.username,
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

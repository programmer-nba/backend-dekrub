const {Admins} = require("../models/admin.model");
const {Members} = require("../models/member.model/member.model");
const {Condition} = require("../models/condition.model");
const {LoginHistory} = require("../models/login.history.model");
const {TokenList} = require("../models/token.list.model");
const token_decode = require("../lib/token_decode");
const {Commission_day} = require("../models/commission/commission.day.model");
const {ImageBank} = require("../models/member.model/image_bank.model");
const {ImageIden} = require("../models/member.model/image_iden.model");
const line = require("../lib/line.notify.register");

const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
require("dotenv").config();

const {google} = require("googleapis");
const multer = require("multer");
const fs = require("fs");

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    // console.log(file.originalname);
  },
});

//update image
async function uploadFileCreate(req, res, {i, reqFiles}) {
  const filePath = req[i].path;
  let fileMetaData = {
    name: req.originalname,
    parents: [process.env.GOOGLE_DRIVE_IMAGE_PRODUCT],
  };
  let media = {
    body: fs.createReadStream(filePath),
  };
  try {
    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
    });

    generatePublicUrl(response.data.id);
    reqFiles.push(response.data.id);
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
}

async function generatePublicUrl(res) {
  console.log("generatePublicUrl");
  try {
    const fileId = res;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
    console.log(result.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
}

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
    postcode: Joi.number().required().label("กรุณากรอกรหัสไปรษณีย์"),
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
          commission_day: 0,
          commission_week: 0,
        };
      } else {
        return res.status(400).send({
          status: false,
          message: "ไม่พบข้อมูลผู้แนะ",
        });
      }
    }
    //เพิ่มข้อมูลลงฐานข้อมูล
    const member = await Members.create(data);
    console.log(member);
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

exports.checkPassword = async (req, res) => {
  const {username, password} = req.body;
  // const admin = await Admins.findOne({username});
  const member = await Members.findOne({username});
  const validPasswordAdmin = await bcrypt.hash(password, member.password);
  console.log(validPasswordAdmin);
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

//เรียกข้อมูลมูลผู้ใช้
exports.edit = async (req, res) => {
  try {
    const token = token_decode(req.headers["token"]);
    const member = await Members.findOne({_id: token._id});

    const bank = req.body.back ? req.body.back : member.bank;
    const iden = req.body.iden ? req.body.iden : member.iden;
    const name = req.body.name ? req.body.name : member.name;
    const tel = req.body.tel ? req.body.tel : member.tel;
    const address = req.body.address ? req.body.address : member.address;
    const subdistrict = req.body.subdistrict
      ? req.body.subdistrict
      : member.subdistrict;
    const district = req.body.district ? req.body.district : member.district;
    const provide = req.body.provider ? req.body.provider : member.province;
    const commission_day = req.body.commission_day
      ? req.body.commission
      : member.commission_day;
    const commission_week = req.body.commission_week
      ? req.body.commission
      : member.commission_week;
    if (member) {
      await Members.findByIdAndUpdate(token._id, {
        bank: bank,
        iden: iden,
        name: name,
        tel: tel,
        address: address,
        subdistrict: subdistrict,
        district: district,
        provide: provide,
        commission_day: commission_day,
        commission_week: commission_week,
      });
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
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

//แก้ไขหรือตั้งรหัสผ่านใหม่
exports.resetPassword = async (req, res) => {
  try {
    const id = req.body.member_number;
    const username = req.body.username;
    const member = await Members.findOne({
      member_number: id,
      username: username,
    });
    const encrytedPassword = await bcrypt.hash(member.tel, 10);
    console.log(encrytedPassword);
    const change_password = await Members.findByIdAndUpdate(member._id, {
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

//ลืมรหัสผ่าน
exports.forgotPassword = async (req, res) => {
  try {
    const vali = (data) => {
      const schema = Joi.object({
        phone: Joi.string().required().label("ไม่พบเบอร์โทรศัพท์"),
        member_number: Joi.string().required().label("ไม่พบรหัสสมาชิก"),
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
    const member = await Members.findOne({tel: req.body.phone});
    if (!member) {
      return res
        .status(403)
        .send({status: false, message: "ไม่พบข้อมูลลูกค้า"});
    } else {
      if (req.body.member_number !== member.member_number) {
        return res
          .status(403)
          .send({
            status: false,
            message: "ข้อมูลไม่ตรงกัน กรุณาตรวจสอบใหม่อีกครั้ง",
          });
      } else {
        const encrytedPassword = await bcrypt.hash(req.body.password, 10);
        const change_password = await Members.findByIdAndUpdate(member._id, {
          password: encrytedPassword,
        });
        if (change_password) {
          return res
            .status(200)
            .send({
              status: true,
              message: "ทำการเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว",
            });
        } else {
          return res
            .status(400)
            .send({status: false, message: "เปลี่ยนรหัสผ่านไม่สำเร็จ"});
        }
      }
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

exports.verify_bank = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "bank_image", maxCount: 10},
    ]);
    upload(req, res, async function (err) {
      if (req.files.bank_image) {
        console.log("มีรูปเข้ามา");
        await uploadImageBank(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.verify_iden = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "iden_image", maxCount: 10},
    ]);
    upload(req, res, async function (err) {
      console.log(req.body.number);
      if (req.files.iden_image) {
        console.log("มีรูปเข้ามา");
        await uploadImageIden(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.confirmBank = async (req, res) => {
  try {
    const updateStatus = await ImageBank.findOne({_id: req.params.id});
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    if (updateStatus) {
      updateStatus.status.push({
        status: "ยืนยันเรียบร้อยแล้ว",
        timestamp: dayjs(Date.now()).format(),
      });
      updateStatus.save();
      let data = {
        ...member.bank,
        remark: "ยืนยันเรียบร้อยแล้ว",
        status: true,
      };
      const res_update = await Members.findByIdAndUpdate(member._id, {
        bank: data,
      });
      if (res_update) {
        res.status(200).send({
          message: "ส่งข้อมูลเรียบร้อย",
          status: true,
        });
      } else {
        res.status(404).send({
          message: "เกิดข้อผิดพลาด",
          status: false,
        });
      }
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.confirmIden = async (req, res) => {
  try {
    const updateStatus = await ImageIden.findOne({_id: req.params.id});
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    if (updateStatus) {
      updateStatus.status.push({
        status: "ยืนยันเรียบร้อยแล้ว",
        timestamp: dayjs(Date.now()).format(),
      });
      updateStatus.save();
      let data = {
        ...member.iden,
        remark: "ยืนยันเรียบร้อยแล้ว",
        status: true,
      };
      const res_update = await Members.findByIdAndUpdate(member._id, {
        iden: data,
      });
      if (res_update) {
        res.status(200).send({
          message: "ส่งข้อมูลเรียบร้อย",
          status: true,
        });
      } else {
        res.status(404).send({
          message: "เกิดข้อผิดพลาด",
          status: false,
        });
      }
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

module.exports.Getverify_iden = async (req, res) => {
  try {
    const order = await ImageIden.find();
    if (order) {
      return res.status(200).send({
        status: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: order,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({message: "มีบางอย่างผิดพลาด", error: "server side error"});
  }
};

module.exports.Getverify_idenByid = async (req, res) => {
  try {
    const order = await ImageIden.findById(req.params.id);
    if (order) {
      return res.status(200).send({
        status: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: order,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      error: "server side error",
    });
  }
};

module.exports.Getverify_bank = async (req, res) => {
  try {
    const order = await ImageBank.find();
    if (order) {
      return res.status(200).send({
        status: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: order,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({message: "มีบางอย่างผิดพลาด", error: "server side error"});
  }
};

module.exports.Getverify_bankByid = async (req, res) => {
  try {
    const order = await ImageBank.findById(req.params.id);
    if (order) {
      return res.status(200).send({
        status: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: order,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      error: "server side error",
    });
  }
};

async function uploadImageBank(req, res) {
  try {
    const filePathImg = req.files.bank_image[0].path;
    const decode = token_decode(req.headers["token"]);
    const member = await Members.findById(decode._id);
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ"});
    }
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.bank_image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_IMAGE_PRODUCT}`],
    };

    console.log(fileMetaDataImg);

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });
    generatePublicUrl(responseImg.data.id);
    let data = {
      ...member.bank,
      name: req.body.name,
      number: req.body.number,
      image: responseImg.data.id,
      remark: "อยู่ระหว่างการตรวจสอบ",
      status: false,
    };
    const res_update = await Members.findByIdAndUpdate(decode._id, {
      bank: data,
    });
    if (res_update) {
      const data = {
        member_number: member.member_number,
        name: member.name,
        picture: responseImg.data.id,
        status: [
          {
            status: "อยู่ระหว่างการตรวจสอบ",
            timestamp: dayjs(Date.now()).format(""),
          },
        ],
      };
      await ImageBank.create(data);
      res.status(200).send({
        message: "ส่งข้อมูลเรียบร้อย",
        status: true,
      });
    } else {
      res.status(404).send({
        message: `ไม่สามารถสร้างได้`,
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
}

async function uploadImageIden(req, res) {
  try {
    const filePathImg = req.files.iden_image[0].path;
    const decode = token_decode(req.headers["token"]);
    const member = await Members.findById(decode._id);
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ"});
    }
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.iden_image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_IMAGE_PRODUCT}`],
    };

    console.log(fileMetaDataImg);

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });
    generatePublicUrl(responseImg.data.id);
    let data = {
      ...member.iden,
      number: req.body.number,
      image: responseImg.data.id,
      remark: "อยู่ระหว่างการตรวจสอบ",
      status: false,
    };
    const res_update = await Members.findByIdAndUpdate(decode._id, {
      iden: data,
    });
    if (res_update) {
      const data = {
        member_number: member.member_number,
        name: member.name,
        picture: responseImg.data.id,
        status: [
          {
            status: "อยู่ระหว่างการตรวจสอบ",
            timestamp: dayjs(Date.now()).format(""),
          },
        ],
      };
      await ImageIden.create(data);
      res.status(200).send({
        message: "ส่งข้อมูลเรียบร้อย",
        status: true,
      });
    } else {
      res.status(404).send({
        message: `ไม่สามารถสร้างได้`,
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
}

module.exports.condition = async (req, res) => {
  try {
    const members = await Members.findOne({
      _id: req.params.id,
    });
    const data = {
      member_number: members.member_number,
      name: members.name,
      tel: members.tel,
      username: members.username,
      status: "ยอมรับเงื่อนไข",
      timestamp: dayjs(Date.now()).format(),
    };
    const conditions = new Condition(data);
    conditions.save();
    if (conditions) {
      return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

module.exports.Getcondition = async (req, res) => {
  try {
    const condition = await Condition.find();
    return res.status(200).send({
      status: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: condition,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

exports.Conditiondelete = async (req, res) => {
  try {
    const id = req.params.id;
    const condition = await Condition.findByIdAndDelete(id);
    if (condition) {
      return res.status(200).send({status: true, message: "ลบข้อมูลสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ลบข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.deletebank = async (req, res) => {
  try {
    const id = req.params.id;
    const bank = await ImageBank.findByIdAndDelete(id);
    if (bank) {
      return res.status(200).send({status: true, message: "ลบข้อมูลสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ลบข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.deleteiden = async (req, res) => {
  try {
    const id = req.params.id;
    const iden = await ImageIden.findByIdAndDelete(id);
    if (iden) {
      return res.status(200).send({status: true, message: "ลบข้อมูลสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ลบข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

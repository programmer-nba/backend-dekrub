const { Members, validate } = require("../../models/member.model/member.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");
exports.addUser = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ status: false, message: error.details[0].message });
    }
    //check username
    const username = await Members.findOne({ username: req.body.username });
    if (username) {
      return res
        .status(400)
        .send({
          status: false,
          message: "ชื่อผู้ใช้งานนี้มีในระบบเรียบร้อยแล้ว",
        });
    }
    const encrytedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await Members.create({
      ...req.body,
      password: encrytedPassword,
    });
    if (user) {
      return res
        .status(201)
        .send({ status: true, message: "เพิ่มผู้ใช้งานเรียบร้อยแล้ว" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "เพิ่มผู้ใช้งานไม่สำเร็จ" });
    }
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

exports.editUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;
    if (!req.body.password) {
      Members.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((data) => {
          if (!data) {
            return res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            return res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "มีบ่างอย่างผิดพลาด" + id,
            status: false,
          });
        });
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      Members.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
        .then((data) => {
          if (!data) {
            return res.status(404).send({
              message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
              status: false,
            });
          } else
            return res.send({
              message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
              status: true,
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้",
            status: false,
          });
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

//ดึงข้อมูล
exports.getAll = async (req, res) => {
  try {
    const user = await Members.find();
    if (user) {
      return res.status(200).send({ status: true, data: user });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

//ดึงข้อมูลโดย _id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Members.findById(id);
    if (user) {
      return res.status(200).send({ status: true, data: user });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ไม่พบข้อมูลในระบบ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

//ดึงข้อมูลโดย _id
exports.getByMemberNumber = async (req, res) => {
  try {
    const member_number = req.params.member_number;
    const user = await Members.findOne({ member_number: member_number });
    if (user) {
      return res.status(200).send({ status: true, data: user });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ไม่พบข้อมูลในระบบ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

//ดึงข้อมูลโดย _id
exports.getMemberRef = async (req, res) => {
  try {
    const user = await Members.findOne({ member_number: req.params.id });
    console.log(user);
    if (user) {
      const res_data = {
        member_ref: user.member_ref,
        name: user.name,
        tel: user.tel,
        address: user.address,
        subdistrict: user.subdistrict,
        district: user.district,
        province: user.province,
        postcode: user.postcode,
      };
      return res.status(200).send({ status: true, data: res_data });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ไม่พบข้อมูลในระบบ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

//ลบข้อมูลผู้ใช้งาน
exports.delUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Members.findByIdAndDelete(id);
    if (user) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลผู้ใช้งานสำเร็จ" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ลบข้อมูลผู้ใช้งานไม่สำเร็จ" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
  }
};

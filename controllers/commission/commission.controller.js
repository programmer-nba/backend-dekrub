const axios = require("axios");
const {
  Commission_day,
} = require("../../models/commission/commission.day.model");
const {
  Commission_week,
} = require("../../models/commission/commission.week.model");
const {
  Commission_week_regis,
} = require("../../models/commission/commission.week.regis.model");

//get all commission day
module.exports.GetAllDay = async (req, res) => {
  try {
    const commission_day = await Commission_day.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: commission_day});
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//get all commission week
module.exports.GetAllWeek = async (req, res) => {
  try {
    const commission_week = await Commission_week.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: commission_week});
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//get all commission day
module.exports.GetAllWeekRegister = async (req, res) => {
  try {
    const commission_week_register = await Commission_week_regis.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: commission_week_register});
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};
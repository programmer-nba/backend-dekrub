const axios = require("axios");
const {
  Percent_Commission,
} = require("../../models/commission/percent.commission.model");
const dayjs = require("dayjs");

//create percent commission day
module.exports.create = async (req, res) => {
  try {
    const data = {
      code: "percent_Commission_day",
      level_one: req.body.level_one,
      level_two: req.body.level_two,
      timestamp: dayjs(Date.now()).format(""),
    };
    const percent_commission = await Percent_Commission.create(data);
    if (percent_commission) {
      return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//create percent commission day
module.exports.createDay = async (req, res) => {
  try {
    const data = {
      code: "percent_Commission_day",
      level_one: req.body.level_one,
      level_two: req.body.level_two,
      timestamp: dayjs(Date.now()).format(""),
    };
    const percent_commission = await Percent_Commission.create(data);
    if (percent_commission) {
      return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//create percent commission day
module.exports.createWeek = async (req, res) => {
  try {
    const data = {
      code: "percent_Commission_week",
      level_one: req.body.level_one,
      level_two: req.body.level_two,
      timestamp: dayjs(Date.now()).format(""),
    };
    const percent_commission = await Percent_Commission.create(data);
    if (percent_commission) {
      return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//get percent commission day
module.exports.GetAllDay = async (req, res) => {
  try {
    const percent_commission = await Percent_Commission.findOne({
      code: "percent_Commission_day",
    });
    return res.status(200).send({
      status: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: percent_commission,
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

//get percent commission week
module.exports.GetAllWeek = async (req, res) => {
  try {
    const percent_commission = await Percent_Commission.findOne({
      code: "percent_Commission_week",
    });
    return res.status(200).send({
      status: true,
      message: "ดึงข้อมูลสำเร็จ",
      data: percent_commission,
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

//update percent commission day
module.exports.UpdateDay= async (req, res) => {
    const percent_day = await Percent_Commission.findOne({_id: req.params.id});
    if (percent_day.code === "percent_Commission_day") {
      const UpdateDay = await Percent_Commission.findByIdAndUpdate(
        req.params.id,
        {
          level_one: req.body.level_one,
          level_two: req.body.level_two,
          timestamp: dayjs(Date.now()).format(""),
        }
      );
      if (UpdateDay) {
        return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
      } else {
        return res.status(403).send({
          status: false,
          message: "ไม่สามารถบันทึกได้",
        });
      }
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  };

//update percent commission week
module.exports.UpdateWeek = async (req, res) => {
  const percent_week = await Percent_Commission.findOne({_id: req.params.id});
  if (percent_week.code === "percent_Commission_week") {
    const UpdateDay = await Percent_Commission.findByIdAndUpdate(
      req.params.id,
      {
        level_one: req.body.level_one,
        level_two: req.body.level_two,
        timestamp: dayjs(Date.now()).format(""),
      }
    );
    if (UpdateDay) {
      return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
};

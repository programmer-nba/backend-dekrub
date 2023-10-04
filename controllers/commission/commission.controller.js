const axios = require("axios");
const {
  Commission_day,
} = require("../../models/commission/commission.day.model");
const {
  Commission_week,
} = require("../../models/commission/commission.week.model");
const {WithdrawDays} = require("../../models/commission/withdraw.day.model");
const {WithdrawWeeks} = require("../../models/commission/withdraw.week.model");
const {Members} = require("../../models/member.model/member.model.js");
const dayjs = require("dayjs");
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

//get all withdraw commission day
module.exports.GetWithdrawDay = async (req, res) => {
  try {
    const withdrawDay = await WithdrawDays.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: withdrawDay});
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

//get all withdraw commission day
module.exports.GetWithdrawWeek = async (req, res) => {
  try {
    const withdrawWeek = await WithdrawWeeks.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: withdrawWeek});
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      err: "server side error",
    });
  }
};

//Withdraw Commissin Day
module.exports.WithdrawDay = async (req, res) => {
  try {
    const data = {
      member_number: req.body.member_number,
      amount: req.body.amount,
      status: [
        {
          status: "รอตรวจสอบ",
          timestamp: dayjs(Date.now()).format(""),
        },
      ],
      timestamp: dayjs(Date.now()).format(""),
    };
    const withdrawDay = await WithdrawDays.create(data);
    if (withdrawDay) {
      const member = await Members.findOne({
        member_number: req.body.member_number,
      });
      const new_commission = member.commission_day - req.body.amount;
      await Members.findByIdAndUpdate(member._id, {
        commission_day: new_commission,
      });
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

//Withdraw Commissin Week
module.exports.WithdrawWeek = async (req, res) => {
  try {
    const data = {
      member_number: req.body.member_number,
      amount: req.body.amount,
      status: [
        {
          status: "รอตรวจสอบ",
          timestamp: dayjs(Date.now()).format(""),
        },
      ],
      timestamp: dayjs(Date.now()).format(""),
    };
    const withdrawWeek = await WithdrawWeeks.create(data);
    if (withdrawWeek) {
      const member = await Members.findOne({
        member_number: req.body.member_number,
      });
      const new_commission = member.commission_week - req.body.amount;
      await Members.findByIdAndUpdate(member._id, {
        commission_week: new_commission,
      });
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

//confirm order Day
module.exports.confirmDay = async (req, res) => {
  const updateStatus = await WithdrawDays.findOne({_id: req.params.id});
  console.log(updateStatus);
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยืนยันการรับออร์เดอร์สำเร็จ", data: updateStatus});
};

//confirm order Day
module.exports.confirmWeek = async (req, res) => {
  const updateStatus = await WithdrawWeeks.findOne({_id: req.params.id});
  console.log(updateStatus);
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยืนยันการรับออร์เดอร์สำเร็จ", data: updateStatus});
};

//cancel order Day
module.exports.cancelDay = async (req, res) => {
  const updateStatus = await WithdrawDays.findOne({_id: req.params.id});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยกเลิกออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    const new_commission = member.commission_day + updateStatus.amount;
    await Members.findByIdAndUpdate(member._id, {
      commission_day: new_commission,
    });
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยกเลิกออร์เดอร์สำเร็จ", data: updateStatus});
};

//cancel order Week
module.exports.cancelWeek = async (req, res) => {
  const updateStatus = await WithdrawWeeks.findOne({_id: req.params.id});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยกเลิกออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    const new_commission = member.commission_week + updateStatus.amount;
    await Members.findByIdAndUpdate(member._id, {
      commission_week: new_commission,
    });
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยกเลิกออร์เดอร์สำเร็จ", data: updateStatus});
};

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

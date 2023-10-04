const {
  NewOrderMembers,
  validate,
} = require("../../models/member.model/member.neworder.model.js");
const {Members} = require("../../models/member.model/member.model.js");
const {
  Commission_day,
} = require("../../models/commission/commission.day.model.js");
const {google} = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const dayjs = require("dayjs");

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

module.exports.order = async (req, res) => {
  try {
    let upload = multer({storage: storage}).array("imgCollection", 20);
    upload(req, res, async function (err) {
      if (err) {
        return res.status(403).send({message: "มีบางอย่างผิดพลาด", data: err});
      }
      const reqFiles = [];

      if (!req.files) {
        return res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          data: "No Request Files",
          status: false,
        });
      } else {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          await uploadFileCreate(req.files, res, {i, reqFiles});
        }
        const pipeline = [
          {
            $group: {_id: 0, count: {$sum: 1}},
          },
        ];
        const count = await NewOrderMembers.aggregate(pipeline);
        const countValue = count.length > 0 ? count[0].count + 1 : 1;
        const receiptnumber = `PDK${dayjs(Date.now()).format(
          "YYYYMMDD"
        )}${countValue.toString().padStart(4, "0")}`;
        const data = {
          receiptnumber: receiptnumber,
          member_number: req.body.member_number,
          name: req.body.name,
          amount: req.body.amount,
          slip_img: reqFiles[0],
          status: [
            {
              status: "รอตรวจสอบ",
              timestamp: dayjs(Date.now()).format(""),
            },
          ],
          timestamp: dayjs(Date.now()).format(""),
        };
        const orderNewMember = await NewOrderMembers.create(data);
        if (orderNewMember) {
          return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
        } else {
          return res.status(403).send({
            status: false,
            message: "ไม่สามารถบันทึกได้",
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
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

//get All order
module.exports.GetAll = async (req, res) => {
  try {
    const order = await NewOrderMembers.find();
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

//get order by id
module.exports.GetById = async (req, res) => {
  try {
    const order = await NewOrderMembers.findById(req.params.id);
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

//confirm order
module.exports.confirm = async (req, res) => {
  const updateStatus = await NewOrderMembers.findOne({_id: req.params.id});
  console.log(updateStatus)
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    await Members.findByIdAndUpdate(member._id, {
      status: true,
    });
    const upline = [member.upline.lv1, member.upline.lv2];
    let i = 0;
    const commission = updateStatus.amount - 249;
    const vat3percent = (commission * 3) / 100;
    const remainding_commission = commission - vat3percent;
    const storeData = [];
    const integratedData = {
      member_number: upline[0],
      commission: commission,
      vat3percent: vat3percent,
      remainding_commission: remainding_commission,
    }
    if (integratedData) {
      storeData.push(integratedData);
    }
    const commissionData = {
      data: storeData,
      from_member: updateStatus.member_number,
    }
    console.log(commissionData)
    const commission_day = new Commission_day(commissionData);
    commission_day.save();
    const member2 = await Members.findOne({
      member_number: upline[0],
    })
    const new_commission_day = member2.commission_day + remainding_commission;
    await Members.findByIdAndUpdate(member2._id, {
      commission_day: new_commission_day,
    });
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยืนยันการรับออร์เดอร์สำเร็จ", data: updateStatus});
};

//cancel order
module.exports.cancel = async (req, res) => {
  const updateStatus = await NewOrderMembers.findOne({_id: req.params.id});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยกเลิกออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
  } else {
    return res.status(403).send({message: "เกิดข้อผิดพลาด"});
  }
  return res
    .status(200)
    .send({message: "ยกเลิกออร์เดอร์สำเร็จ", data: updateStatus});
};

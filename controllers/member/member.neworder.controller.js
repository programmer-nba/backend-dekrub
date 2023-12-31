const {
  NewOrderMembers,
  validate,
} = require("../../models/member.model/member.neworder.model.js");
const {Members} = require("../../models/member.model/member.model.js");
const {Product} = require("../../models/product.model/product.model");
const {
  Percent_Commission,
} = require("../../models/commission/percent.commission.model.js");
const {
  Commission_day,
} = require("../../models/commission/commission.day.model.js");
const {
  Commission_week_regis,
} = require("../../models/commission/commission.week.regis.model.js");
const {google} = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const dayjs = require("dayjs");
const line = require("../../lib/line.notify.register.js")

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
        const product = await Product.findOne({
          _id: req.body.product_id,
        });
        const order = [];
        if (product) {
          const price = product.price * 1;
          order.push({
            product_id: product._id,
            product_name: product.name,
            product_detail: product.detail,
            price: product.price,
            quantity: 1,
            totalprice: price,
          });
        }
        const new_quantity = product.quantity - 1;
        await Product.findByIdAndUpdate(product._id, {
          quantity: new_quantity,
        });
        const data = {
          receiptnumber: receiptnumber,
          member_number: req.body.member_number,
          name: req.body.name,
          amount: product.price,
          product_detail: order,
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
          const message = `
เลขที่ทำรายการ : ${orderNewMember.receiptnumber}
จาก : ${orderNewMember.member_number}
ชื่อ : ${orderNewMember.name}
จำนวน : ${orderNewMember.amount} บาท

ตรวจสอบได้ที่ : http://shop.dekrubshop.com/

*รบกวนตรวจสอบด้วยนะคะ/ครับ*`;
          await line.linenotify(message);
          return res.status(200).send({status: true, message: "บันทึกสำเร็จ", data: orderNewMember});
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

//delete
module.exports.DeleteById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await NewOrderMembers.findByIdAndDelete(id);
    if (order) {
      return res.status(200).send({status: true, message: "ลบสำเร็จ"});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ลบไม่สำเร็จ กรุณาลองอีกครั้ง"});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

//confirm order
module.exports.confirm = async (req, res) => {
  const updateStatus = await NewOrderMembers.findOne({_id: req.params.id});
  const percent = await Percent_Commission.findOne({code: "register"});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(""),
    });
    updateStatus.save();

    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    await Members.findByIdAndUpdate(member._id, {
      status: true,
    });
    const upline = [member.upline];

    const validLevel = upline.filter((item) => item !== "-");

    const commission_level1 = percent.level_two;
    const vat_level1 = (commission_level1 * 3) / 100;
    const remainding_commission_level1 = commission_level1 - vat_level1;

    const commission_level2 = percent.level_one;
    const vat_level2 = (commission_level2 * 3) / 100;
    const remainding_commission_level2 = commission_level2 - vat_level2;

    for (const TeamMemberData of upline) {
      if (TeamMemberData.lv1 !== "-") {
        const storeData = [];
        const integratedData = {
          member_number: TeamMemberData.lv1,
          commission: commission_level1,
          vat3percent: vat_level1,
          remainding_commission: remainding_commission_level1,
        };
        if (integratedData) {
          storeData.push(integratedData);
        }
        const commissionData = {
          data: storeData,
          from_member: updateStatus.member_number,
          timestamp: dayjs(Date.now()).format(),
        };
        const commission_day = new Commission_day(commissionData);
        commission_day.save();
        const member2 = await Members.findOne({
          member_number: TeamMemberData.lv1,
        });
        const new_commission_day =
          member2.commission_day + remainding_commission_level1;
        await Members.findByIdAndUpdate(member2._id, {
          commission_day: new_commission_day,
        });
      }

      if (TeamMemberData.lv2 !== "-") {
        const storeData = [];
        const integratedData = {
          member_number: TeamMemberData.lv2,
          commission: commission_level2,
          vat3percent: vat_level2,
          remainding_commission: remainding_commission_level2,
        };
        if (integratedData) {
          storeData.push(integratedData);
        }
        const commissionData = {
          data: storeData,
          from_member: updateStatus.member_number,
          timestamp: dayjs(Date.now()).format(),
        };
        const commission_week_regis = new Commission_week_regis(commissionData);
        commission_week_regis.save();
        const member2 = await Members.findOne({
          member_number: TeamMemberData.lv2,
        });
        const new_commission_day =
          member2.commission_day + remainding_commission_level2;
        await Members.findByIdAndUpdate(member2._id, {
          commission_day: new_commission_day,
        });
      }
    }
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

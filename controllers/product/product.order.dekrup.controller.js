const { Product } = require("../../models/product.model/product.model");
const {
  OrderProductModel,
} = require("../../models/product.model/product.order.model");
const { Members } = require("../../models/member.model/member.model");
const {
  Commission_week,
} = require("../../models/commission/commission.week.model");
// const line = require("");

const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { request } = require("http");
const line = require("../../lib/line.notify.order.js");

// const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
// 
// const oauth2Client = new google.auth.OAuth2(
// CLIENT_ID,
// CLIENT_SECRET,
// REDIRECT_URI
// );
// 
// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
// const drive = google.drive({
// version: "v3",
// auth: oauth2Client,
// });
// 

const uploadFolder = path.join(__dirname, '../../assets/slip');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    // console.log(file.originalname);
  },
});

module.exports.order = async (req, res) => {
  try {
    const orders = [];
    const pipeline = [
      {
        $group: { _id: 0, count: { $sum: 1 } },
      },
    ];
    const count = await OrderProductModel.aggregate(pipeline);
    const countValue = count.length > 0 ? count[0].count + 1 : 1;
    const receiptnumber = `PD${dayjs(Date.now()).format("YYYYMMDD")}${countValue
      .toString()
      .padStart(5, "0")}`;
    for (let item of req.body.product_detail) {
      const product = await Product.findOne({
        _id: item.product_id,
      });

      if (product) {
        const price = product.price * item.quantity;
        orders.push({
          product_id: product._id,
          product_name: product.name,
          product_detail: product.detail,
          price: product.price,
          quantity: item.quantity,
          totalprice: price,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(403).send({ message: "จำนวนสินค้าไม่เพียงพอ" });
      } else {
        const new_quantity = product.quantity - item.quantity;

        await Product.findByIdAndUpdate(product._id, {
          quantity: new_quantity,
        });
      }
    }
    const totalprice = orders.reduce((sum, el) => sum + el.totalprice, 0);
    const data = {
      receiptnumber: receiptnumber,
      member_number: req.body.member_number,
      customer_name: req.body.customer_name,
      customer_tel: req.body.customer_tel,
      customer_address: req.body.customer_address,
      customer_line: req.body.customer_line,
      product_detail: orders,
      status: [
        {
          status: "รอตรวจสอบ",
          timestamp: dayjs(Date.now()).format(""),
        },
      ],
      totalprice: totalprice,
      timestamp: dayjs(Date.now()).format(""),
    };
    const orderDekrup = await OrderProductModel.create(data);
    if (orderDekrup) {
      const message = `
เลขที่ทำรายการ : ${orderDekrup.receiptnumber}
จาก : ${orderDekrup.member_number}
ชื่อ : ${orderDekrup.customer_name}
เบอร์โทรศัพท์ : ${orderDekrup.customer_tel}
ID_line : ${orderDekrup.customer_line}
จำนวน : ${orderDekrup.totalprice} บาท

ตรวจสอบได้ที่ : http://shop.dekrubshop.com/

*รบกวนตรวจสอบด้วยนะคะ/ครับ*`;
      await line.linenotify(message);
      return res
        .status(200)
        .send({ status: true, message: "บันทึกสำเร็จ", data: orderDekrup });
    } else {
      return res.status(403).send({
        status: false,
        message: "ไม่สามารถบันทึกได้",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.updatePictures = async (req, res) => {
  try {
    const id = req.params.id;
    let upload = multer({ storage: storage }).single("imgCollection");
    upload(req, res, async function (err) {
      if (err) {
        return res.status(403).send({ message: "มีบางอย่างผิดพลาด", data: err });
      }

      if (!req.file) {
        return res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          data: "No Request Files",
          status: false,
        });
      }

      const orderService = await OrderProductModel.findById(id);
      if (!orderService) {
        return res.status(404).send({ message: "Order service not found" });
      }

      if (!orderService.picture) {
        orderService.picture = [];
      }

      // const newPictures = orderService.picture.concat(reqFiles);
      const NewPicture = await OrderProductModel.findByIdAndUpdate(
        id,
        { picture: req.file.filename },
        { useFindAndModify: false, }
      );
      if (NewPicture) {
        return res.status(200).send({
          message: "อัพเดทรูปภาพสำเร็จ",
        });
      } else {
        return res
          .status(403)
          .send({ message: "อัพเดทรูปภาพไม่สำเร็จ", data: err });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.getImage = async (req, res) => {
  try {
    const imgname = req.params.imgname;
    const imagePath = path.join(__dirname, '../../assets/slip', imgname);
    return res.sendFile(imagePath)
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}
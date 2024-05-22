const { Product, validate } = require("../../models/product.model/product.model");
const { Category } = require("../../models/product.model/category.model");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// const {google} = require("googleapis");
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
// oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
// const drive = google.drive({
// version: "v3",
// auth: oauth2Client,
// });
// 

const uploadFolder = path.join(__dirname, '../../assets/product');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports.create = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("imgCollection");
    // let upload = multer({ storage: storage }).array("imgCollection", 20);
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
      } else {
        // const url = req.protocol + "://" + req.get("host");
        // for (var i = 0; i < req.files.length; i++) {
        // await uploadFileCreate(req.files, res, { i, reqFiles });
        // }
        //create collection
        const category = await Category.findById(req.body.categoryid);
        const codeCategory = category.code;
        const productNumber = await Product.find();
        const count = productNumber.length + 1;
        const code = `${codeCategory}DQ${count.toString().padStart(4, "0")}`;
        const data = {
          picture: req.file.filename,
          code: code,
          name: req.body.name,
          category: req.body.categoryid,
          detail: req.body.detail,
          cost: Number(req.body.cost),
          price: Number(req.body.price),
          quantity: Number(req.body.quantity),
        };
        const productDekrup = await Product.create(data);
        if (productDekrup) {
          return res.status(200).send({ status: true, message: "บันทึกสำเร็จ" });
        } else {
          return res
            .status(403)
            .send({ status: false, message: "ไม่สามารถบันทึกได้" });
        }
        //end
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

//get All product
module.exports.GetAll = async (req, res) => {
  try {
    const product = await Product.find();
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
  }
};

//get All product
module.exports.updateProduct = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("imgCollection");
    upload(req, res, async function (err) {
      if (!req.file) {
        const product = await Product.findOne({ _id: req.params.id });
        if (product) {
          await Product.findByIdAndUpdate(req.params.id,
            { ...req.body },
            { useFindAndModify: false, }
          ).then((data) => {
            if (!data) {
              return res.status(404).send({
                message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                status: false,
              });
            } else {
              return res.status(200).send({
                message: "แก้ไขสินค้าสำเร็จ",
                status: true,
              });
            }
          }).catch((err) => {
            return res.status(500).send({
              message: "มีบ่างอย่างผิดพลาด",
              status: false,
            });
          });
        } else {
          return res.status(500).send({
            message: "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข",
            status: false,
          });
        }
      } else {
        const product = await Product.findOne({ _id: req.params.id });
        if (product) {
          const data = [];
          data.push(req.file.filename);
          await Product.findByIdAndUpdate(req.params.id,
            { ...req.body, picture: data },
            { useFindAndModify: false, }
          ).then((data) => {
            if (!data) {
              fs.unlinkSync(req.file.path);
              return res.status(404).send({
                message: `ไม่สามารถเเก้ไขสินค้านี้ได้!`,
                status: false,
              });
            } else {
              return res.status(200).send({
                message: "แก้ไขสินค้าสำเร็จ",
                status: true,
              });
            }
          }).catch((err) => {
            fs.unlinkSync(req.file.path);
            return res.status(500).send({
              message: "มีบ่างอย่างผิดพลาด",
              status: false,
            });
          });
        } else {
          return res.status(500).send({
            message: "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข",
            status: false,
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
  }
};

//get product by id
module.exports.GetById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูล" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
  }
};

//delete product
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (product) {
      return res.status(200).send({ status: true, message: "ลบสำเร็จ" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ลบไม่สำเร็จ กรุณาลองอีกครั้ง" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};


module.exports.getImage = async (req, res) => {
  try {
    const imgname = req.params.imgname;
    const imagePath = path.join(__dirname, '../../assets/product', imgname);
    return res.sendFile(imagePath)
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}
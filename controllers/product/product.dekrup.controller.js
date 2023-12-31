const {Product, validate} = require("../../models/product.model/product.model");
const {Category} = require("../../models/product.model/category.model");
const fs = require("fs");
const multer = require("multer");
const {google} = require("googleapis");
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

module.exports.create = async (req, res) => {
  try {
    let upload = multer({storage: storage}).array("imgCollection", 20);
    upload(req, res, async function (err) {
      if (err) {
        return res.status(403).send({message: "มีบางอย่างผิดพลาด", data: err});
      }
      const reqFiles = [];
      if (!req.files) {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          data: "No Request Files",
          status: false,
        });
      } else {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          await uploadFileCreate(req.files, res, {i, reqFiles});
        }
        //create collection
        const category = await Category.findById(req.body.categoryid);
        const codeCategory = category.code;
        const productNumber = await Product.find();
        const count = productNumber.length + 1;
        const code = `${codeCategory}DQ${count.toString().padStart(4, "0")}`;
        const data = {
          picture: reqFiles[0],
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
          return res.status(200).send({status: true, message: "บันทึกสำเร็จ"});
        } else {
          return res
            .status(403)
            .send({status: false, message: "ไม่สามารถบันทึกได้"});
        }
        //end
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

//get All product
module.exports.GetAll = async (req, res) => {
  try {
    const product = await Product.find();
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: product});
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({message: "มีบางอย่างผิดพลาด", error: "server side error"});
  }
};

//get All product
module.exports.Update = async (req, res) => {
  try {
    const product = await Product.findOne({_id: req.params.id});
    if (product) {
      let upload = multer({storage: storage}).array("imgCollection", 20);
      upload(req, res, async function (err) {
        const code = req.body.code ? req.body.code : product.code;
        const name = req.body.name ? req.body.name : product.name;
        const detail = req.body.detail ? req.body.detail : product.detail;
        const cost = req.body.cost ? req.body.cost : product.cost;
        const price = req.body.price ? req.body.price : product.price;
        const quantity = req.body.quantity
          ? req.body.quantity
          : product.quantity;
        const category = req.body.category
          ? req.body.category
          : product.category;

        const reqFiles = [];
        if (!req.files) {
          res.status(500).send({
            message: "มีบางอย่างผิดพลาด",
            data: "No Request Files",
            status: false,
          });
        } else {
          const url = req.protocol + "://" + req.get("host");
          for (var i = 0; i < req.files.length; i++) {
            await uploadFileCreate(req.files, res, {i, reqFiles});
          }
          const data = {
            code: code,
            picture: reqFiles[0],
            name: name,
            detail: detail,
            price: price,
            cost: cost,
            category: category,
            quantity: quantity,
          };
          console.log(data);
          await Product.findByIdAndUpdate(req.params.id, {
            code: code,
            picture: reqFiles[0],
            name: name,
            detail: detail,
            price: price,
            cost: cost,
            category: category,
            quantity: quantity,
          });
        }
      });
      return res
        .status(200)
        .send({message: "อัพเดทสินค้าสำเร็จ", data: product});
    } else {
      return res.status(403).send({message: "เกิดข้อผิดพลาด"});
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({message: "มีบางอย่างผิดพลาด", error: "server side error"});
  }
};

//get product by id
module.exports.GetById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(403).send({status: false, message: "ไม่พบข้อมูล"});
    } else {
      return res
        .status(200)
        .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: product});
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({message: "มีบางอย่างผิดพลาด", error: "server side error"});
  }
};

//delete product
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (product) {
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

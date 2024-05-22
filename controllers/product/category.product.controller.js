const { Category, validate, } = require("../../models/product.model/category.model");
const fs = require("fs");
const multer = require("multer");

//create category
module.exports.create = async (req, res) => {
  try {
    const codeNumber = await Category.find();
    const count = codeNumber.length + 1;
    const code = `PDK${count.toString().padStart(3, '0')}`;
    const data = {
      code: code,
      name: req.body.name,
    };
    const category = await Category.create(data);
    if (category) {
      return res.status(200).send({ status: true, message: "บันทึกสำเร็จ" });
    } else {
      return res
        .status(403)
        .send({ status: false, message: "ไม่สามารถบันทึกได้" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

//get All category
module.exports.GetAll = async (req, res) => {
  try {
    const category = await Category.find();
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: category });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
  }
};

//get category by id
module.exports.GetById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูล" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: category });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
  }
};

//put category
module.exports.UpdateById = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryUpdate = await Category.findById(id);
    const name = req.body.name ? req.body.name : categoryUpdate.name;
    const data = {
      name: name,
    };
    const category = await Category.findByIdAndUpdate(id, data);
    if (category) {
      return res
        .status(200)
        .send({ message: "อัพเดตข้อมูลสำเร็จ", data: category });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "แก้ไขไม่สำเร็จ กรุณาลองอีกครั้ง" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

//delete category
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if (category) {
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


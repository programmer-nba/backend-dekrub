const {
  OrderProductModel,
  validate,
} = require("../../models/product.model/product.order.model");

//get All order
module.exports.GetAll = async (req, res) => {
  try {
    const order = await OrderProductModel.find();
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
    const order = await OrderProductModel.findById(req.params.id);
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

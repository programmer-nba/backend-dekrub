const dayjs = require("dayjs");
const {
  OrderProductModel,
} = require("../../models/product.model/product.order.model");

//confirm order
module.exports.confirm = async (req, res) => {
  const updateStatus = await OrderProductModel.findOne({_id: req.params.id});
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

//cancel order
module.exports.cancel = async (req, res) => {
    const updateStatus = await OrderProductModel.findOne({_id: req.params.id});
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
      .send({message: "ยืนยันการรับออร์เดอร์สำเร็จ", data: updateStatus});
};

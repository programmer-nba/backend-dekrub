const dayjs = require("dayjs");
const {
  OrderProductModel,
} = require("../../models/product.model/product.order.model");
const {
  Commission_week,
} = require("../../models/commission/commission.week.model.js");
const {Members} = require("../../models/member.model/member.model.js");

//confirm order
module.exports.confirm = async (req, res) => {
  const updateStatus = await OrderProductModel.findOne({_id: req.params.id});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });
    const upline = [member.upline.lv1];
    
    const commission = 10;
    const vat3percent = (commission * 3) / 100;
    const remainding_commission = commission - vat3percent;
    const storeData = [];
    const integratedData = {
      member_number: upline[0],
      commission: commission,
      vat3percent: vat3percent,
      remainding_commission: remainding_commission,
    };
    if (integratedData) {
      storeData.push(integratedData);
    }
    const commissionData = {
      data: storeData,
      from_member: updateStatus.member_number,
    };
    const commission_week = new Commission_week(commissionData);
    commission_week.save();
    const member2 = await Members.findOne({
      member_number: upline[0],
    })
    const new_commission_week = member2.commission_week + remainding_commission;
    await Members.findByIdAndUpdate(member2._id, {
      commission_week: new_commission_week,
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

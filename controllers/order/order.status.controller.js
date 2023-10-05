const dayjs = require("dayjs");
const {
  OrderProductModel,
} = require("../../models/product.model/product.order.model");
const {
  Commission_week,
} = require("../../models/commission/commission.week.model.js");
const {
  Percent_Commission,
} = require("../../models/commission/percent.commission.model.js");
const {Members} = require("../../models/member.model/member.model.js");

//confirm order
module.exports.confirm = async (req, res) => {
  const updateStatus = await OrderProductModel.findOne({_id: req.params.id});
  const percent = await Percent_Commission.findOne({code: "administer"});
  if (updateStatus) {
    updateStatus.status.push({
      status: "ยืนยันออเดอร์",
      timestamp: dayjs(Date.now()).format(),
    });
    updateStatus.save();
    const member = await Members.findOne({
      member_number: updateStatus.member_number,
    });

    const upline = [member.upline];

    const commission_level1 = percent.level_two;
    const vat_level1 = (commission_level1 * 3) / 100;
    const remainding_commission_level1 = commission_level1 - vat_level1;

    const commission_level3 = percent.level_three;
    const vat_level3 = (commission_level3 * 3) / 100;
    const remainding_commission_level3 = commission_level3 - vat_level3;

    for (const TeamMemberData of upline) {
      if (TeamMemberData.lv1) {
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
        };
        const commission_week = new Commission_week(commissionData);
        commission_week.save();
        const member2 = await Members.findOne({
          member_number: TeamMemberData.lv1,
        });
        const new_commission_week =
          member2.commission_week + remainding_commission_level1;
        await Members.findByIdAndUpdate(member2._id, {
          commission_week: new_commission_week,
        });
      }
    }

    const storeData = [];
    const integratedData = {
      member_number: updateStatus.member_number,
      commission: commission_level3,
      vat3percent: vat_level3,
      remainding_commission: remainding_commission_level3,
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
      member_number: updateStatus.member_number,
    });
    const new_commission_week =
      member2.commission_week + remainding_commission_level1;
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

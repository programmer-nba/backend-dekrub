const { Product } = require("../../models/product.model/product.model");
const { Members } = require('../../models/member/member.model');
const { OrderProductModel } = require("../../models/product.model/product.order.model");
const { Commission_week } = require("../../models/commission/commission.week.model");

// const line = require("");

const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

module.exports.order = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.body.product_detail[0].product_id,
    });
    if (product) {
      let token = req.headers["token"];
      jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, decoded) => {
        if (err) {
          return res.status(403).send({message: "Not have permission"});
        } else {
          const pipeline = [
            {
              $group: {_id: 0, count: {$sum: 1}},
            },
          ];
          const count = await OrderProductModel.aggregate(pipeline);
          const countValue = count.length > 0 ? count[0].count + 1 : 1;
          const receiptnumber = `PD${dayjs(Date.now()).format(
            "YYYYMMDD"
          )}${countValue.toString().padStart(5, "0")}`;

          const totalprice = product.price * req.body.product_detail[0].quantity;
          //commission
          const commission = 10;
          //vat commission
          const vat = (commission * 3) / 100;
          //real commission
          const realcommission = (commission - vat);
          const data = {
            receiptnumber: receiptnumber,
            customer_name: req.body.customer_name,
            customer_tel: req.body.customer_tel,
            customer_address: req.body.customer_address,
            customer_line: req.body.customer_line,
            product_detail: [
              {
                product_id: product.code,
                product_name: product.name,
                product_detail: product.detail,
                quantity: req.body.product_detail[0].quantity,
                price: product.price,
              },
            ],
            status: [
              {
                status: 'รอตรวจสอบ',
                timestamp: dayjs(Date.now()).format(''),
              }
            ],
            totalprice: totalprice,
          };
          const getTeamMember = await Members.findOne({ member_number: req.body.member_number });
          if (!getTeamMember) {
            return res.status(403).send({message: 'รหัสสมาชิกนี้ยังไม่ได้เป็นสมาชิกของ Dekrub Shop'});
          } else {
            const upline = [ getTeamMember.upline.lv1, getTeamMember.upline.lv2];
            const validUplines = upline.filter(item => item !== '-');
            const uplineData = [];
            let i = 0;
            for (const item of validUplines) {
                const include = await Members.findOne({ member_number: item});
                // console.log('include : ', include);
                if (include !== null){
                    uplineData.push({
                        member_number: include.member_number,
                        iden: include.iden.number,
                        name: include.name,
                        address: {
                            address: include.address,
                            subdistrict: include.subdistrict,
                            district: include.district,
                            province: include.province,
                            postcode: include.postcode
                        },
                        tel: include.tel,
                        level: (i+1)
                    });
                    i++;
                }
            }
            const storeData = [];
            for (const TeamMemberData of uplineData){
              let integratedData;
              if (TeamMemberData.level == '1'){
                integratedData = {
                  member_number: TeamMemberData.member_number,
                  lv: TeamMemberData.level,
                  iden: TeamMemberData.iden,
                  name: TeamMemberData.name,
                  address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                  tel: TeamMemberData.tel,
                  commission: commission,
                  vat3percent: vat,
                  remainding_commission: realcommission
                };
              }
              if (TeamMemberData.level == '2'){
                integratedData = {
                  member_number: TeamMemberData.member_number,
                  lv: TeamMemberData.level,
                  iden: TeamMemberData.iden,
                  name: TeamMemberData.name,
                  address: `${TeamMemberData.address.address}${TeamMemberData.address.subdistrict}${TeamMemberData.address.district}${TeamMemberData.address.province}${TeamMemberData.address.postcode}`,
                  tel: TeamMemberData.tel,
                  commission: commission,
                  vat3percent: vat,
                  remainding_commission: realcommission
                };
              }
              if (integratedData) {
                storeData.push(integratedData);
              }
            }
            const orderDekrup = await OrderProductModel.create(data);
            const commissionData = {
              data: storeData,
              orderid: orderDekrup._id,
            };
            console.log(storeData)
            const commission_week = await Commission_week.create(commissionData);
            if (orderDekrup || commission_week) {
              return res
                .status(200)
                .send({status: true, message: "บันทึกสำเร็จ"});
            } else {
              return res.status(403).send({
                status: false,
                message: "ไม่สามารถบันทึกได้",
              });
            }
          }
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

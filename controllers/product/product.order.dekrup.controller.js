const {Product} = require("../../models/product.model/product.model");
const {
  OrderProductModel,
  validate,
} = require("../../models/product.model/product.order.model");
// const line = require("");

const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

module.exports.order = async (req, res) => {
  try {
    const product = await Product.findOne({_id: req.body.product_detail[0].product_id});
    console.log(product)
    if (product) {
      let token = req.headers["token"];
      jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, decoded) => {
        if (err) {
          return res.status(403).send({message: "Not have permission"});
        } else {
          const pipeline = [
            {
              $group: { _id: 0, count: { $sum: 1 } }
            }
          ]
          const count = await OrderProductModel.aggregate(pipeline);
          const countValue = count.length > 0 ? count[0].count + 1 : 1;
          const receiptnumber = `PD${dayjs(Date.now()).format(
            "YYYYMMDD"
          )}${countValue.toString().padStart(5, "0")}`;

          const totalprice = product.price * req.body.product_detail[0].quantity
        
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
            totalprice: totalprice,
          };
          const orderDekrup = await OrderProductModel.create(data);
          if (orderDekrup) {
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
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};


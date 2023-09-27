const router = require("express").Router();
// const authAdmin = require("../../lib/auth.admin");
const OrderProduct = require("../../controllers/order/order.product.controller");
const auth = require("../../lib/auth");

router.get("/list", auth, OrderProduct.GetAll);
router.get("/list/:id", auth, OrderProduct.GetById);

module.exports = router;

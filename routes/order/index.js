const router = require("express").Router();
// const authAdmin = require("../../lib/auth.admin");
const OrderProduct = require("../../controllers/order/order.product.controller");
const OrderStatus = require("../../controllers/order/order.status.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/list", auth, OrderProduct.GetAll);
router.get("/admin/list", authAdmin, OrderProduct.GetAll);
router.get("/list/:id", auth, OrderProduct.GetById);
router.get("/admin/list/:id", authAdmin, OrderProduct.GetById);

router.put("/confirm/:id", authAdmin, OrderStatus.confirm);
router.put("/cancel/:id", authAdmin, OrderStatus.cancel);

module.exports = router;

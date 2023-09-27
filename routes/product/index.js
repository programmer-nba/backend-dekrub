const router = require("express").Router();
const product = require("../../controllers/product/product.dekrup.controller");
const productOrder = require("../../controllers/product/product.order.dekrup.controller")
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

//create Product
router.post("/create", authAdmin, product.create);
router.get("/list", authAdmin, product.GetAll);
router.get("/:id", authAdmin, product.GetById);
router.delete("/delete/:id", authAdmin, product.delete);

//order
router.post("/order", auth, productOrder.order);

module.exports = router;

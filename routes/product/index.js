const router = require("express").Router();
const product = require("../../controllers/product/product.dekrup.controller");
const productOrder = require("../../controllers/product/product.order.dekrup.controller")
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

//create Product
router.post("/create", authAdmin, product.create);
router.get("/list", auth, product.GetAll);
router.get("/admin/list", authAdmin, product.GetAll);
router.put("/update/:id", authAdmin, product.Update);
router.get("/member/list", product.GetAll);
router.get("/:id", authAdmin, product.GetById);
router.get("/member/:id", product.GetById);
router.delete("/delete/:id", authAdmin, product.delete);

//order
router.post("/order", auth, productOrder.order);
router.put("/order/updatepicture/:id", auth, productOrder.updatePictures)

module.exports = router;

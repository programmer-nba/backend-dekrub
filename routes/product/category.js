const router = require("express").Router();
const category = require("../../controllers/product/category.product.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

//create category
router.post("/create", authAdmin, category.create);
router.get("/list", authAdmin, category.GetAll);
router.get("member/list", auth, category.GetAll);
router.get("/:id", authAdmin, category.GetById);
router.get("/member/:id", auth, category.GetById);
router.put("/update/:id", authAdmin, category.UpdateById);
router.delete("/delete/:id", authAdmin, category.delete);

module.exports = router;
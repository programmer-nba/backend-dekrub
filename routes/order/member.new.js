const router = require("express").Router();
const OrderNewMember = require("../../controllers/member/member.neworder.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/new/list", authAdmin, OrderNewMember.GetAll);
router.get("/new/list/:id", authAdmin, OrderNewMember.GetById);
router.delete("/new/delete/:id", authAdmin, OrderNewMember.DeleteById);

router.post("/order", auth, OrderNewMember.order);

router.put("/new/confirm/:id", authAdmin, OrderNewMember.confirm);
router.put("/new/cancel/:id", authAdmin, OrderNewMember.cancel);

module.exports = router;
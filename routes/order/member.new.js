const router = require("express").Router();
const OrderNewMember = require("../../controllers/member/member.neworder.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/new/list", auth, OrderNewMember.GetAll);
router.get("/new/list/:id", auth, OrderNewMember.GetById);

router.post("/order", auth, OrderNewMember.order);

router.put("/new/confirm/:id", authAdmin, OrderNewMember.confirm);
router.put("/new/cancel/:id", authAdmin, OrderNewMember.cancel);

module.exports = router;
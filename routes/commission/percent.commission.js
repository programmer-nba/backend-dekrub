const router = require('express').Router();
const PercentCommission = require('../../controllers/commission/percent.commission.controller');
const authAdmin = require('../../lib/auth.admin');

//commission day
router.post("/commission/day", authAdmin, PercentCommission.createDay);
router.get("/commission/day", authAdmin, PercentCommission.GetAllDay);
router.put("/commission/day/:id", authAdmin, PercentCommission.UpdateDay);

//commission week
router.post("/commission/week", authAdmin, PercentCommission.createWeek);
router.get("/commission/week", authAdmin, PercentCommission.GetAllWeek);
router.put("/commission/week/:id", authAdmin, PercentCommission.UpdateWeek);

module.exports = router;
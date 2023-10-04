const router = require('express').Router();
const commission = require('../../controllers/commission/commission.controller');
const auth = require('../../lib/auth');
const authAdmin = require('../../lib/auth.admin');

//Commission Day
router.get("/day", auth, commission.GetAllDay);
router.post("/day", auth, commission.WithdrawDay);
router.put("/day/:id", authAdmin, commission.confirmDay);
router.put("/day/cancel/:id", authAdmin, commission.cancelDay);

//Commission Week
router.get("/week", auth, commission.GetAllWeek);
router.post("/week", auth, commission.WithdrawWeek);
router.put("/week/:id", authAdmin, commission.confirmWeek);
router.put("/week/cancel/:id", authAdmin, commission.cancelWeek);

module.exports = router;
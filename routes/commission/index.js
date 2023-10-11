const router = require('express').Router();
const commission = require('../../controllers/commission/commission.controller');
const auth = require('../../lib/auth');
const authAdmin = require('../../lib/auth.admin');

//Commission Day Register
router.get("/day", commission.GetAllDay);
router.delete("/day/:id",authAdmin, commission.deleteDay);

//Commission Week
router.get("/week", commission.GetAllWeek);
router.delete("/week/:id",authAdmin, commission.deleteWeek);

//Commission Week Register
router.get("/register/week", commission.GetAllWeekRegister);
router.delete("/register/week/:id",authAdmin, commission.deleteWeekRegister);



module.exports = router;
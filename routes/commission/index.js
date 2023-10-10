const router = require('express').Router();
const commission = require('../../controllers/commission/commission.controller');
const auth = require('../../lib/auth');
const authAdmin = require('../../lib/auth.admin');

//Commission Day Register
router.get("/day", commission.GetAllDay);

//Commission Week
router.get("/week", commission.GetAllWeek);

//Commission Week Register
router.get("/register/week", commission.GetAllWeekRegister);



module.exports = router;
const router = require('express').Router();
const commission = require('../../controllers/commission/commission.controller');
const auth = require('../../lib/auth');
const authAdmin = require('../../lib/auth.admin');

router.get("/day", auth, commission.GetAllDay);
router.get("/week", auth, commission.GetAllWeek);

module.exports = router;
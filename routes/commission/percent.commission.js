const router = require('express').Router();
const PercentCommission = require('../../controllers/commission/percent.commission.controller');
const authAdmin = require('../../lib/auth.admin');

//commission 
router.get("/commission", authAdmin, PercentCommission.GetAll);
router.get("/commission/:id", authAdmin, PercentCommission.GetAllByid);
router.put("/commission/:id", authAdmin, PercentCommission.Update);


module.exports = router;
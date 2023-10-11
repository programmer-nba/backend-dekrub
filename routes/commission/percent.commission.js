const router = require('express').Router();
const PercentCommission = require('../../controllers/commission/percent.commission.controller');
const authAdmin = require('../../lib/auth.admin');

//commission
router.post('/commission', authAdmin, PercentCommission.create);
router.get("/commission", authAdmin, PercentCommission.GetAll);
router.get("/commission/:id", authAdmin, PercentCommission.GetAllByid);
router.put("/commission/:id", authAdmin, PercentCommission.Update);
router.delete('/delete/:id', authAdmin, PercentCommission.delete);


module.exports = router;
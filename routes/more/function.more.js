const router = require('express').Router();
const FunctionMore = require('../../controllers/more.controller/function.more.controller');
const authAdmin = require('../../lib/auth.admin');

router.post("/create", authAdmin, FunctionMore.create);
router.get("/", authAdmin, FunctionMore.getAll);
router.get('/:id', authAdmin, FunctionMore.getById);
router.put('/:id',authAdmin, FunctionMore.update);

module.exports = router;
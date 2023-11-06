const router = require('express').Router();
const FunctionMore = require('../../controllers/more.controller/function.more.controller');
const authAdmin = require('../../lib/auth.admin');

router.post("/create", authAdmin, FunctionMore.create);
router.get("/", FunctionMore.getAll);
router.get('/:id', FunctionMore.getById);
// router.get('/:func_name',authAdmin, FunctionMore.getByFunctionName);
router.put('/:id',authAdmin, FunctionMore.update);
router.delete('/:id', FunctionMore.delete)

module.exports = router;
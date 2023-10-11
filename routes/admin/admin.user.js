const router = require('express').Router();
const Admin = require('../../controllers/admin/admin.controller');
const authAdmin = require('../../lib/auth.admin');

router.post('/',authAdmin, Admin.addUser);
router.get('/',authAdmin, Admin.getAll);
router.get('/:id', authAdmin, Admin.getById);
router.put('/:id', authAdmin, Admin.editUser);
router.delete('/delete/:id', authAdmin, Admin.delUser);

router.get('/back')

module.exports = router;
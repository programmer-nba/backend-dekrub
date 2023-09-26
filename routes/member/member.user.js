const router = require('express').Router();
const Member = require('../../controllers/member/member.controller')
const authAdmin = require('../../lib/auth.admin')

router.post('/',authAdmin, Member.addUser);
router.get('/',authAdmin, Member.getAll);
router.get('/:id', authAdmin, Member.getById);
router.put('/:id', authAdmin, Member.editUser);
router.delete('/delete/:id', authAdmin, Member.delUser);

module.exports = router;
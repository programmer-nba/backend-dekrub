const router = require('express').Router();
const Member = require('../../controllers/member/member.controller');
const auth = require('../../lib/auth');
const authAdmin = require('../../lib/auth.admin');

router.post('/',authAdmin, Member.addUser);
router.get('/',authAdmin, Member.getAll);
router.get('/list', auth, Member.getAll);
router.get('/:id', authAdmin, Member.getById);
router.get('/:member_number', authAdmin, Member.getByMemberNumber);
router.put('/:id', authAdmin, Member.editUser);
router.delete('/delete/:id', authAdmin, Member.delUser);

module.exports = router;
const router = require('express').Router();
const Member = require('../../controllers/member/member.controller');
const MemberTeam = require('../../controllers/member/memberteam.controller');

router.get('/check/:id', Member.getMemberRef);
router.get('/team/:member_number', MemberTeam.GetMemberTeam);

module.exports = router;
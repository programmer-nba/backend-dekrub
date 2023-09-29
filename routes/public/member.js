const router = require('express').Router();
const MemberTeam = require('../../controllers/member/memberteam.controller');

router.get('/team/:member_number', MemberTeam.GetMemberTeam);

module.exports = router;
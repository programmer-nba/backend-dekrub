const router = require('express').Router();
const main = require('../controllers/main.controller');
const auth = require('../lib/auth');
const authPassword = require('../lib/auth.password');

router.post('/register', main.register);
router.post('/login', main.login);
router.post('/logout',auth, main.logout);
router.get('/me',auth, main.me);
router.put('/edit', auth, main.edit);

//เปลี่ยนรหัสผ่านใหม่
router.post('/set_password', authPassword, main.setPassword);
router.post('/reset_password', main.resetPassword);


module.exports = router;
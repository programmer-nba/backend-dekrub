const router = require('express').Router();
const main = require('../controllers/main.controller');
const auth = require('../lib/auth');
const authAdmin = require('../lib/auth.admin');
const authPassword = require('../lib/auth.password');

router.post('/register', main.register);
router.post('/login', main.login);
router.get('/checkpassword', main.checkPassword);
router.post('/logout',auth, main.logout);
router.get('/me',auth, main.me);
router.put('/edit', auth, main.edit);
router.post('/condition/:id', auth, main.condition);
router.get('/condition/', authAdmin, main.Getcondition);
router.delete('/condition/delete/:id', authAdmin, main.Conditiondelete);

router.put('/verify_bank', auth, main.verify_bank);
router.put('/verify_iden', auth, main.verify_iden);

router.get('/verify_iden', authAdmin, main.Getverify_iden);
router.get('/verify_iden/:id', authAdmin, main.Getverify_idenByid);
router.get('/verify_bank', authAdmin, main.Getverify_bank);
router.get('/verify_bank/:id', authAdmin, main.Getverify_bankByid);
router.put('/verify_bank/confirm/:id', authAdmin, main.confirmBank);
router.put('/verify_iden/confirm/:id', authAdmin, main.confirmIden);

//เปลี่ยนรหัสผ่านใหม่
router.post('/set_password', authPassword, main.setPassword);
router.post('/reset_password', main.resetPassword);


module.exports = router;
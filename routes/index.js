const router = require('express').Router();
const main = require('../controllers/main.controller');
const auth = require('../lib/auth');

// const authPassword = require('');

router.post('/register', main.register);
router.post('/login', main.login);
router.get('/me',auth, main.me);


module.exports = router;
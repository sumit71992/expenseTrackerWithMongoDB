const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../middleware/auth');
const router = express.Router();


router.post('/forgotpassword',userController.forgotPassword);
router.post('/updatepassword/:id',userController.updatepassword);
router.get('/resetpassword/:id',userController.resetPassword);

module.exports = router;
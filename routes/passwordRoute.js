const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();


router.post('/forgotpassword',userController.forgotPassword);
router.get('/resetpassword/:id',userController.resetPassword);
router.post('/updatepassword/:id',userController.updatepassword);


module.exports = router;
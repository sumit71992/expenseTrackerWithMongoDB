const express = require('express');
const orderController = require('../controllers/orderController');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

router.get('/buypremium', userAuthentication.authenticate, orderController.premium);
router.post('/updatestatus', userAuthentication.authenticate, orderController.updateStatus)

module.exports = router;

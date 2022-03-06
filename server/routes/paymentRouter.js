const router = require('express').Router();

const {
  processPayment,
  sendStripeApiKey,
} = require('../controllers/paymentController');
const { auth } = require('../controllers/authController');

router.route('/process').post(auth, processPayment);
router.route('/getStripeApiKey').get(auth, sendStripeApiKey);

module.exports = router;

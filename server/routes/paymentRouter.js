const router = require('express').Router();

const {
  processPayment,
  sendStripeApiKey,
  refund,
} = require('../controllers/paymentController');
const { auth, authTo } = require('../controllers/authController');

router.route('/getStripeApiKey').get(auth, sendStripeApiKey);
router.route('/process').post(auth, processPayment);

router.route('/refund/:orderId').patch(auth, authTo('seller'), refund);

module.exports = router;

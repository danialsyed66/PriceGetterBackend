const router = require('express').Router();

const {
  processPayment,
  sendStripeApiKey,
} = require('../controllers/paymentController');
const { auth } = require('../controllers/authController');

router.use(auth);

router.route('/process').post(processPayment);
router.route('/getStripeApiKey').get(sendStripeApiKey);

module.exports = router;

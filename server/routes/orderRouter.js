const router = require('express').Router();

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  myOrders,
} = require('../controllers/orderController');

const { auth, authTo } = require('../controllers/authController');

router.use(auth);

router.route('/my').get(myOrders);

router.route('/').get(authTo('admin'), getOrders).post(createOrder);

router.route('/:id').get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;

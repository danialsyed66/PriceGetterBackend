const router = require('express').Router();

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  myOrders,
  requestRefund,
} = require('../controllers/orderController');

const { auth, authTo } = require('../controllers/authController');

router.route('/my').get(auth, myOrders);

router
  .route('/')
  .get(auth, authTo('admin', 'seller'), getOrders)
  .post(auth, createOrder);

router
  .route('/:id')
  .get(auth, getOrder)
  .patch(auth, authTo('admin', 'seller'), updateOrder)
  .delete(auth, authTo('admin', 'seller'), deleteOrder);

router.route('/requestRefund/:orderId').patch(auth, requestRefund);

module.exports = router;

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

router.route('/my').get(auth, myOrders);

router
  .route('/')
  .get(auth, authTo('admin', 'sellers'), getOrders)
  .post(auth, createOrder);

router
  .route('/:id')
  .get(auth, getOrder)
  .patch(auth, updateOrder)
  .delete(auth, deleteOrder);

module.exports = router;

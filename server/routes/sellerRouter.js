const router = require('express').Router();

const { auth, authTo } = require('../controllers/authController');
const {
  createSeller,
  sellerSeeder,
  getSellerProducts,
  getSellerOrders,
  dashboard,
} = require('../controllers/sellerController');

router.route('/').post(auth, authTo('admin'), createSeller);
router.route('/seeder').post(auth, authTo('admin'), sellerSeeder);
router.route('/products').get(auth, authTo('seller'), getSellerProducts);
router.route('/orders').get(auth, authTo('seller'), getSellerOrders);
router.route('/dashboard').get(auth, authTo('seller'), dashboard);

module.exports = router;

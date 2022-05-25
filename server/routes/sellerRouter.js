const router = require('express').Router();

const { auth, authTo } = require('../controllers/authController');
const {
  createSeller,
  sellerSeeder,
  getSellerProducts,
} = require('../controllers/sellerController');

router.route('/').post(auth, authTo('admin'), createSeller);
router.route('/seeder').post(auth, authTo('admin'), sellerSeeder);
router.route('/products').get(auth, authTo('admin'), getSellerProducts);

module.exports = router;

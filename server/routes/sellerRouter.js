const router = require('express').Router();

const { auth, authTo } = require('../controllers/authController');
const {
  createSeller,
  sellerSeeder,
} = require('../controllers/sellerController');

router.route('/').post(auth, authTo('admin'), createSeller);
router.route('/seeder').post(auth, authTo('admin'), sellerSeeder);

module.exports = router;

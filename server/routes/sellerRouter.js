const router = require('express').Router();

const { auth } = require('../controllers/authController');
const {
  createSeller,
  sellerSeeder,
} = require('../controllers/sellerController');

router.route('/').post(createSeller);
router.route('/seeder').post(sellerSeeder);

module.exports = router;

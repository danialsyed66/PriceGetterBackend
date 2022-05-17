const router = require('express').Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  auth,
} = require('../controllers/authController');

const {
  getUserProfile,
  updateUserProfile,
  handleFavouriteProducts,
} = require('../controllers/userController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);

// User Routes
router.route('/changePassword').patch(auth, changePassword);

router.route('/profile').get(auth, getUserProfile);
router.route('/profile/edit').post(auth, updateUserProfile);

router.route('/favourites/:productId').patch(auth, handleFavouriteProducts);

module.exports = router;

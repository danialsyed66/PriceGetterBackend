const router = require('express').Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  auth,
  verifyOTP,
} = require('../controllers/authController');

const {
  getUserProfile,
  updateUserProfile,
  handleFavouriteProducts,
  getUserFavourites,
} = require('../controllers/userController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyOtp/:otp').get(verifyOTP);
router.route('/resetPassword/:otp').patch(resetPassword);

// User Routes
router.route('/changePassword').patch(auth, changePassword);

router.route('/profile').get(auth, getUserProfile);
router.route('/profile/edit').post(auth, updateUserProfile);

router.route('/favourites/:productId').patch(auth, handleFavouriteProducts);
router.route('/favourites').get(auth, getUserFavourites);

module.exports = router;

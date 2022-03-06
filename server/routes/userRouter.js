const router = require('express').Router();

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  auth,
  authTo,
} = require('../controllers/authController');

const {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
  handleFavouriteProducts,
} = require('../controllers/userController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);

router.route('/changePassword').patch(auth, changePassword);

router.route('/profile').get(auth, getUserProfile);
router.route('/profile/edit').post(auth, updateUserProfile);

router.route('/favourites/:productId').patch(auth, handleFavouriteProducts);

router.route('/users').get(auth, authTo('admin'), getAllUsers);
router
  .route('/users/:id')
  .get(auth, authTo('admin'), getUserById)
  .patch(auth, authTo('admin'), updateUser)
  .delete(auth, authTo('admin'), deleteUser);

module.exports = router;

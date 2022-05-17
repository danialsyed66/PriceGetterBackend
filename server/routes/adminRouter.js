const router = require('express').Router();

const {
  adminLogin,
  changePassword,
  auth,
  authTo,
} = require('../controllers/authController');

const {
  getAllSellers,
  getPendingSellers,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

router.route('/login').post(adminLogin);

router.route('/changePassword').patch(auth, authTo('admin'), changePassword);

// For Users
router.route('/users').get(auth, authTo('admin'), getAllUsers);
router
  .route('/users/:id')
  .get(auth, authTo('admin'), getUserById)
  .patch(auth, authTo('admin'), updateUser)
  .delete(auth, authTo('admin'), deleteUser);

// For Sellers
router.route('/sellers').get(auth, authTo('admin'), getAllSellers);
router.route('/sellers/pending').get(auth, authTo('admin'), getPendingSellers);

module.exports = router;

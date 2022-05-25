const router = require('express').Router();

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getReviews,
  createReview,
  deleteReview,
  getHomePage,
} = require('../controllers/productController');

const { auth, authTo, authCheck } = require('../controllers/authController');
const { processProduct } = require('../controllers/sellerController');

router.route('/').get(authCheck, getProducts);
router.route('/getHomePage').get(authCheck, getHomePage);

router
  .route('/')
  .post(auth, authTo('admin', 'seller'), processProduct, createProduct);

router.route('/review').get(getReviews).patch(auth, createReview);
router.route('/review/delete').patch(auth, deleteReview);

router
  .route('/:id')
  .get(getProduct)
  .patch(auth, authTo('admin', 'seller'), updateProduct)
  .delete(auth, authTo('admin', 'seller'), deleteProduct);

module.exports = router;

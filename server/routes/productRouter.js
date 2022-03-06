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

const { auth, authTo } = require('../controllers/authController');

router.route('/').get(getProducts);
// router.route('/getHomePage').get(getHomePage);

router.route('/create').post(auth, authTo('admin', 'seller'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .patch(auth, authTo('admin', 'seller'), updateProduct)
  .delete(auth, authTo('admin', 'seller'), deleteProduct);

router
  .route('/:ProductId/review')
  .get(getReviews)
  .patch(auth, createReview)
  .delete(auth, deleteReview);

module.exports = router;

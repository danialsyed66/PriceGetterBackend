const router = require('express').Router();

const { auth } = require('../controllers/authController');
const {
  addPost,
  deletePost,
  getPosts,
  getPost,
  likePost,
  addComment,
  deleteComment,
} = require('../controllers/postController');

router.route('/').get(getPosts).post(auth, addPost.validator, addPost.func);

router
  .route('/:postId')
  .get(getPost)
  .delete(auth, deletePost)
  .patch(auth, likePost);

router
  .route('/:postId/comments')
  .post(auth, addComment.validator, addComment.func);

router.route('/:postId/comments/:commentId').delete(auth, deleteComment);

module.exports = router;

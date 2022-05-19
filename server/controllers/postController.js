const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post');
const catchAsync = require('../utils/catchAsync');

exports.addPost = {
  validator: [check('text', 'Text is Required').not().isEmpty()],
  func: catchAsync(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({
        status: 'error',
        data: {
          errors: errors.array(),
        },
      });

    const { text, images } = req.body;

    const { id, name, avatar } = await User.findOne({ _id: req.user.id });

    const post = await Post.create({
      text,
      images,
      user: id,
      name,
      avatar: avatar ? avatar.url : undefined,
    });

    res.status(201).json({
      status: 'success',
      data: { post },
    });
  }),
};

exports.getPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find().sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { posts },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId)
    return res.status(400).json({
      status: 'error',
      data: {
        message: 'Post id is required to make a comment',
      },
    });

  const post = await Post.findById(postId);

  if (!post)
    return res.status(404).json({
      status: 'error',
      message: 'There is no post by this id.',
    });

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId)
    return res.status(400).json({
      status: 'error',
      data: {
        message: 'Post id is required to delete a post',
      },
    });

  const post = await Post.findById(postId);

  if (!post)
    return res.status(404).json({
      status: 'error',
      message: 'There is no post by this id.',
    });

  if (post.user.toString() !== req.user.id)
    return res.status(401).json({
      status: 'error',
      message: 'You are not authorized.',
    });

  await Post.findByIdAndDelete(postId);

  await res.status(204).json({
    status: 'success',
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId)
    return res.status(400).json({
      status: 'error',
      data: {
        message: 'Post id is required to make a comment',
      },
    });

  const post = await Post.findById(postId);

  if (!post)
    return res.status(404).json({
      status: 'error',
      message: 'There is no post by this id.',
    });

  const likeIndex = post.likes
    .map(like => like.user.toString())
    .indexOf(req.user.id);

  if (likeIndex >= 0) post.likes.splice(likeIndex, 1);
  else post.likes.unshift({ user: req.user.id });

  await post.save();

  res.status(201).json({
    status: 'success',
    data: {
      likes: post.likes,
    },
  });
});

exports.addComment = {
  validator: [check('text', 'Text is Required').not().isEmpty()],
  func: catchAsync(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({
        status: 'error',
        data: {
          errors: errors.array(),
        },
      });

    const { postId } = req.params;

    if (!postId)
      return res.status(400).json({
        status: 'error',
        data: {
          message: 'Past id is required to make a comment',
        },
      });

    const post = await Post.findById(postId);

    if (!post)
      return res.status(404).json({
        status: 'error',
        data: {
          message: 'Post with given id not found',
        },
      });

    const { text, images } = req.body;

    const { id, name, avatar } = await User.findOne({ _id: req.user.id });

    post.comments.unshift({
      text,
      images,
      user: id,
      name,
      avatar: avatar ? avatar.url : undefined,
    });

    await post.save();

    res.status(201).json({
      status: 'success',
      data: { comments: post.comments },
    });
  }),
};

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;

  if (!postId || !commentId)
    return res.status(400).json({
      status: 'error',
      data: {
        message: "Past and Comment id's are required to delete a comment",
      },
    });

  const post = await Post.findById(postId);

  if (!post)
    return res.status(404).json({
      status: 'error',
      message: 'There is no post by this id.',
    });

  const commentIndex = post.comments
    .map(comment => comment._id.toString())
    .indexOf(commentId);

  if (commentIndex < 0)
    return res.status(404).json({
      status: 'error',
      message: 'There is no comment by this id.',
    });

  if (
    !(
      post.user.toString() === req.user.id ||
      post.comments[commentIndex].user.toString() === req.user.id
    )
  )
    return res.status(401).json({
      status: 'error',
      message: 'You are not authorized.',
    });

  post.comments.splice(commentIndex, 1);

  await post.save();

  res.status(204).json({
    status: 'success',
  });
});

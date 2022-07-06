const User = require('../models/user');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary');

exports.getUserProfile = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

exports.getUserFavourites = catchAsync(async (req, res, next) => {
  const { favourites } = await User.findById(req.user._id).populate({
    path: 'favourites.product',
    select: 'name price url images',
  });

  res.status(200).json({
    status: 'success',
    data: {
      favourites,
    },
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const { _id, avatar } = req.user;
  const { name, email, avatar: avatarBase } = req.body;

  const exists = await User.findOne({
    $and: [{ email }, { _id: { $ne: _id } }],
  });

  if (exists) return next(new AppError('This email is already taken', 400));

  let avatarResult;
  if (avatarBase)
    avatarResult = await cloudinary.v2.uploader.upload(avatarBase, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

  const newData = {
    name,
    email,
    avatar: avatarBase
      ? {
          public_id: avatarResult.public_id,
          url: avatarResult.secure_url,
        }
      : avatar,
  };

  req.user = await User.findByIdAndUpdate(_id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

exports.handleFavouriteProducts = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { user } = req;

  if (!productId)
    return next(
      new AppError('Product id is required to add to favourites', 400)
    );

  const product = await Product.exists({ _id: productId });

  if (!product)
    return next(new AppError('There is no product by this id.', 400));

  const productIndex = user.favourites
    .map(favourite => favourite.product.toString())
    .indexOf(productId);

  if (productIndex >= 0) user.favourites.splice(productIndex, 1);
  else user.favourites.unshift({ product: productId });

  await user.save();

  const favourites = user.favourites.map(favourite => favourite.product);

  res.status(201).json({
    status: 'success',
    data: {
      favourites,
    },
  });
});

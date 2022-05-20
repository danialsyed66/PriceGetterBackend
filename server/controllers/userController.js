const User = require('../models/user');
const Product = require('../models/product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

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
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  req.user = await User.getByIdAndUpdate(newData, {
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

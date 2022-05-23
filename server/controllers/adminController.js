const User = require('../models/user');
const Seller = require('../models/seller');
const Product = require('../models/product');
const factory = require('./factoryController');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

exports.getAllUsers = factory.getAll(User, {
  where: {
    role: 'user',
  },
});

exports.getAllSellers = factory.getAll(User, {
  where: {
    role: 'seller',
  },
});

exports.getPendingSellers = factory.getAll(User, {
  where: {
    role: 'seller-pending',
  },
});

exports.getUserById = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.sellerAction = catchAsync(async (req, res, next) => {
  const role = req.body.action === 'approve' ? 'seller' : 'user';
  const seller = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!seller) return new AppError('Seller with id not found', 404);

  if (role !== 'seller')
    return res.status(200).json({
      status: 'success',
      data: { user: seller },
    });

  const sellert = await Seller.create({
    name: seller.name,
    url: `https://price-getter.netlify.app/seller/${seller._id}`,
    logo: {
      url: 'https://res.cloudinary.com/dlwaao9wl/image/upload/v1653167546/logos/ilfvq5tta1q6ibccxqg4.png',
    },
    user: seller._id,
  });

  return res.status(200).json({
    status: 'success',
    data: { user: seller, seller: sellert },
  });
});

exports.deleteSeller = catchAsync(async (req, res, next) => {
  const doc = await User.findById(req.params.id);

  if (!doc) return new AppError('Seller with id not found', 404);

  if (doc.role !== 'seller')
    return new AppError('Seller with id not found', 404);

  await User.deleteOne({ _id: req.params.id });
  const sellerModel = await Seller.findById({ seller: req.params.id });

  if (sellerModel) {
    await Seller.deleteOne({ seller: req.params.id });
    await Products.delete({ seller: sellerModel._id });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUsersCount = catchAsync(async (req, res, next) => {
  const userCount = await User.countDocuments({ role: 'user' });
  const sellerCount = await User.countDocuments({ role: 'seller' });
  const pendingSellerCount = await User.countDocuments({
    role: 'seller-pending',
  });
  const totalCount = await User.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      totalCount,
      userCount,
      sellerCount,
      pendingSellerCount,
    },
  });
});

exports.getProductsCount = catchAsync(async (req, res, next) => {
  const totalCount = await Product.countDocuments();
  const sellers = await Product.distinct('seller');
  let bySellers = [];

  bySellers = await Promise.all(
    sellers.map(async seller => {
      const productCount = await Product.countDocuments({ seller });
      const sellerObj = await Seller.findById(seller);

      return { productCount, seller: sellerObj };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      totalCount,
      bySellers,
    },
  });
});

const cloudinary = require('cloudinary');

const Seller = require('../models/seller');
const Product = require('../models/product');
const Order = require('../models/order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createSeller = catchAsync(async (req, res, next) => {
  const { name, url, logo, user } = req.body;

  let result;
  if (logo)
    result = await cloudinary.v2.uploader.upload(logo, {
      folder: 'logos',
      width: 150,
      crop: 'scale',
    });

  const seller = await Seller.create({
    name,
    url,
    logo: logo
      ? {
          public_id: result.public_id,
          url: result.secure_url,
        }
      : {
          url: 'https://res.cloudinary.com/dlwaao9wl/image/upload/v1653167546/logos/ilfvq5tta1q6ibccxqg4.png',
        },
    user: user || undefined,
  });

  res.status(201).json({
    status: 'success',
    data: {
      seller,
    },
  });
});

exports.sellerSeeder = catchAsync(async (req, res, next) => {
  const daraz = await Seller.findOne({ name: 'Daraz' });
  const goto = await Seller.findOne({ name: 'Goto' });
  const yayvo = await Seller.findOne({ name: 'Yayvo' });

  const products = await Product.count();
  const darazProducts = await Product.count({ seller: daraz._id });
  const yayvoProducts = await Product.count({ seller: yayvo._id });
  const gotoProducts = await Product.count({ seller: goto._id });
  const otherProducts = await Product.find({
    seller: { $nin: [yayvo._id, daraz._id, goto._id] },
  });
  // console.log(otherProducts);

  // products.forEach(async (product, i) => {
  //   if (product.seller === 'Daraz') product.seller = daraz._id;
  //   if (product.seller === 'Yayvo') product.seller = yayvo._id;

  //   await product.save({ validateBeforeSave: false });
  //   console.log(i);
  // });

  res.status(200).json({
    status: 'success',
    data: {
      products,
      darazProducts,
      yayvoProducts,
      gotoProducts,
      otherProducts,
      // daraz,
      // goto,
      // yayvo,
    },
  });
});

exports.getSellerProducts = catchAsync(async (req, res, next) => {
  const { user } = req;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  const where = { seller: seller._id };

  // Creating a query
  let apiFeatures = new ApiFeatures(
    Product.find(where),
    req.query,
    'images name price rating stock discount'
  )
    .sort()
    .limitFields();

  // Calling the query
  const docs = await apiFeatures.query;

  res.status(200).json({
    status: 'success',
    data: {
      results: docs.length,
      products: docs,
    },
  });
});

exports.getSellerOrders = catchAsync(async (req, res, next) => {
  const { user } = req;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  const where = { seller: seller._id };

  // Creating a query
  let apiFeatures = new ApiFeatures(Order.find(where), req.query).sort();

  // Calling the query
  const docs = await apiFeatures.query;

  res.status(200).json({
    status: 'success',
    data: {
      results: docs.length,
      orders: docs,
    },
  });
});

exports.processProduct = catchAsync(async (req, res, next) => {
  const { user } = req;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  let images = [];

  if (typeof req.body.images === 'string') images = [req.body.images];
  else images = req.body.images;

  let imageLinks = [];

  if (images)
    images?.forEach(async image => {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'products',
      });

      imageLinks.push({ url: result.secure_url, public_id: result.public_id });
    });

  req.body.images = imageLinks;
  req.body.seller = seller._id;
  req.body.category = { search: req.body.category };
  req.body.pricegetter = true;

  next();
});

exports.processProductUpdate = catchAsync(async (req, res, next) => {
  const { user } = req;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  const product = await Product.findOne({
    $and: [{ _id: req.params.id }, { seller: seller._id }],
  });

  if (!product)
    return next(
      new AppError('You donont have any product with given id.', 404)
    );

  let images = [];

  if (typeof req.body.images === 'string') images = [req.body.images];
  else images = req.body.images;

  if (images)
    images?.forEach(async image => {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'products',
      });

      product.images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });

  if (req.body.price < product.price) {
    req.body.oldPrice = product.price;
    req.body.discount =
      ((req.body.oldPrice - req.body.price) * 100) / req.body.oldPrice;
  } else {
    if (req.body.price > product.oldPrice) {
      product.oldPrice = 0;
      req.body.discount = 0;
    } else {
      console.log(1);
      req.body.discount =
        ((product.oldPrice - req.body.price) * 100) / product.oldPrice;
    }
  }

  const category = { search: req.body.category };

  req.body.images = undefined;
  req.body.category = category;

  await product.save();

  next();
});

exports.dashboard = catchAsync(async (req, res, next) => {
  const { user } = req;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  const getData = async query => await query;

  const results = await Promise.all([
    getData(Product.find({ seller: seller._id }).countDocuments()),
    getData(
      Product.find({
        $and: [{ seller: seller._id }, { stock: 0 }],
      }).countDocuments()
    ),
    getData(Order.find({ seller: seller._id }).countDocuments()),
    getData(
      Order.aggregate([
        { $match: { seller: seller._id } },
        {
          $group: {
            _id: undefined,
            total: { $sum: '$totalPrice' },
            item: { $sum: '$itemsPrice' },
            tax: { $sum: '$taxPrice' },
            shipping: { $sum: '$shippingPrice' },
          },
        },
      ])
    ),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      productsCount: results[0],
      outOfStockProducts: results[1],
      ordersCount: results[2],
      revenue: results[3][0],
    },
  });
});

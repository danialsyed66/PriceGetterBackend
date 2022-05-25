const cloudinary = require('cloudinary');

const Seller = require('../models/seller');
const Product = require('../models/product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

  const resPerPage = req.query.resPerPage || process.env.RESULTS_PER_PAGE;

  const seller = await Seller.findOne({ user: user._id });

  if (!seller)
    return next(new AppError('You are not registered as a seller.', 400));

  const where = { seller: seller._id };

  // Creating a query
  let apiFeatures = new ApiFeatures(
    Model.find(where),
    req.query,
    isProduct && 'images name price rating stock discount'
  )
    .search()
    .sort()
    .limitFields()
    .paginate(resPerPage);

  // Calling the query
  const docs = await apiFeatures.query;

  let numOfDocs = await new ApiFeatures(Model.find(where), req.query)
    .search()
    .sort()
    .limitFields()
    .query.countDocuments();

  const data = {
    numOfDocs: numOfDocs,
    resPerPage: +resPerPage,
    products: docs,
  };

  if (!sendRes) return data;

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data,
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

  images.forEach(async image => {
    const result = cloudinary.v2.uploader.upload(image, { folder: 'products' });

    imageLinks.push({ url: result.secure_url, public_id: result.public_id });
  });

  req.body.images = imageLinks;
  req.body.seller = seller._id;

  next();
});

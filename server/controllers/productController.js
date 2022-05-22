const Product = require('../models/product');
const Seller = require('../models/seller');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

exports.getProducts = factory.getAll(Product, {
  getTotalDocs: true,
  populateOptions: {
    path: 'seller',
    select: '-__v -createdAt -updatedAt',
  },
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const query = Product.findById(req.params.id);

  query.populate({
    path: 'seller',
    select: '-__v -createdAt -updatedAt',
  });

  const doc = await query;

  if (!doc) return next(new AppError('Product with id not found', 404));

  let ids = [doc._id];

  const a = await Product.find({
    $and: [
      {
        'category.base': doc.category.base,
      },
      { _id: { $nin: ids } },
    ],
  }).limit(2);

  ids = [...ids, ...a.map(prod => prod._id)];

  const b = await Product.find({
    $and: [
      {
        'category.sub': doc.category.sub,
      },
      { _id: { $nin: ids } },
    ],
  }).limit(2);

  ids = [...ids, ...b.map(prod => prod._id)];

  const c = await Product.find({
    $and: [
      {
        'category.head': doc.category.head,
      },
      { _id: { $nin: ids } },
    ],
  }).limit(2);

  ids = [...ids, ...c.map(prod => prod._id)];

  const d = await Product.find({
    $and: [
      {
        'category.search': doc.category.search,
      },
      {
        seller: { $ne: doc.seller._id },
      },
      { _id: { $nin: ids } },
    ],
  }).limit(7 - ids.length);

  const similar = [...d, ...a, ...b, ...c];

  res.status(200).json({
    status: 'success',
    data: {
      product: doc,
      similar: { results: similar.length, similar },
    },
  });
});

exports.createProduct = factory.createOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.createReview = catchAsync(async (req, res, next) => {
  const {
    productId,
    review: { rating, review },
  } = req.body;

  const product = await Product.findById(productId);

  if (!product) return next(new AppError('Product not found', 404));

  const isReviewd = product.reviews.some(rev => {
    if (rev.user.toString() === req.user.id) {
      rev.rating = rating;
      rev.review = review;
      return true;
    }
  });

  if (!isReviewd)
    product.reviews.push({
      user: req.user.id,
      rating,
      review,
      userName: req.user.name,
    });

  product.noOfReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
    product.noOfReviews;

  await product.save();

  res.status(201).json({
    status: 'success',
    message: isReviewd ? 'Review updated' : 'Review added',
  });
});

exports.getReviews = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.ProductId);

  if (!product) return next(new AppError('Product not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      noOfReviews: product.noOfReviews,
      rating: product.rating,
      reviews: product.reviews,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { productId, reviewId } = req.body;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    review => review._id.toString() !== reviewId
  );

  const noOfReviews = reviews.length;

  const rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  product.reviews = reviews;
  product.noOfReviews = noOfReviews;
  product.rating = rating;

  await product.save();

  res.status(200).json({
    status: 'success',
    message: 'Review removed',
  });
});

exports.getHomePage = catchAsync(async (req, res, next) => {
  const { _id: darazId } = await Seller.findOne({ name: 'Daraz' });
  const { _id: yayvoId } = await Seller.findOne({ name: 'Yayvo' });
  const { _id: gotoId } = await Seller.findOne({ name: 'Goto' });

  const getData = async where => {
    const { data } = await factory.getAll(
      Product,
      {
        where,
        populateOptions: {
          path: 'seller',
          select: '-__v -createdAt -updatedAt',
        },
      },
      false
    )(req, res, next);

    return data;
  };

  const daraz = await getData({ seller: darazId });
  const yayvo = await getData({ seller: yayvoId });
  const goto = await getData({ seller: gotoId });

  const accessories = await getData({ ['category.search']: 'Accessories' });
  const books = await getData({ ['category.search']: 'Books' });
  const cameras = await getData({ ['category.search']: 'Cameras' });
  const clothes = await getData({ ['category.search']: 'Clothes' });
  const electronics = await getData({ ['category.search']: 'Electronics' });
  const food = await getData({ ['category.search']: 'Food' });
  const headphones = await getData({ ['category.search']: 'Headphones' });
  const home = await getData({ ['category.search']: 'Home' });
  const laptops = await getData({ ['category.search']: 'Laptops' });
  const outdoor = await getData({ ['category.search']: 'Outdoor' });
  const smartPhones = await getData({ ['category.search']: 'Smart Phones' });
  const sports = await getData({ ['category.search']: 'Sports' });

  res.status(200).json({
    data: {
      sellers: {
        daraz,
        yayvo,
        goto,
      },
      categories: {
        accessories,
        books,
        cameras,
        clothes,
        electronics,
        food,
        headphones,
        home,
        laptops,
        outdoor,
        smartPhones,
        sports,
      },
    },
  });
});

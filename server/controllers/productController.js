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
  isProduct: true,
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const query = Product.findById(req.params.id);

  query.populate({
    path: 'seller',
    select: '-__v -createdAt -updatedAt',
  });

  const doc = await query;

  if (!doc) return next(new AppError('Product with id not found', 404));

  let idsFound = [doc._id];

  const limitFields = 'images name price oldPrice rating stock seller url';

  const populateOptions = {
    path: 'seller',
    select: '-__v -createdAt -updatedAt',
  };

  const same = await Product.find(
    {
      $and: [
        {
          name: {
            $regex: doc.name.replace(/^(.{15}[^\s]*).*/, '$1'),
            $options: 'i',
          },
        },
        { _id: { $nin: idsFound } },
      ],
    },
    limitFields
  )
    .limit(6)
    .populate(populateOptions);

  idsFound = [...idsFound, ...same.map(prod => prod._id)];

  const similar1 = await Product.find(
    {
      $and: [
        {
          'category.base': doc.category.base,
        },
        { _id: { $nin: idsFound } },
      ],
    },
    limitFields
  )
    .limit(2)
    .populate(populateOptions);

  idsFound = [...idsFound, ...similar1.map(prod => prod._id)];

  const similar2 = await Product.find(
    {
      $and: [
        {
          'category.sub': doc.category.sub,
        },
        { _id: { $nin: idsFound } },
      ],
    },
    limitFields
  )
    .limit(2)
    .populate(populateOptions);

  idsFound = [...idsFound, ...similar2.map(prod => prod._id)];

  const similar3 = await Product.find(
    {
      $and: [
        {
          'category.head': doc.category.head,
        },
        { _id: { $nin: idsFound } },
      ],
    },
    limitFields
  )
    .limit(2)
    .populate(populateOptions);

  idsFound = [...idsFound, ...similar3.map(prod => prod._id)];

  const similar4 = await Product.find(
    {
      $and: [
        {
          'category.search': doc.category.search,
        },
        {
          seller: { $ne: doc.seller._id },
        },
        { _id: { $nin: idsFound } },
      ],
    },
    limitFields
  )
    .limit(2)
    .populate(populateOptions);

  const similar = [...similar1, ...similar2, ...similar3, ...similar4];

  const { clicks } = doc;
  doc.clicks = clicks ? clicks + 1 : 1;
  await doc.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      product: doc,
      same: { results: same.length, same },
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
    reviews.length > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
      : 0;

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
  const { _id: iBucketId } = await Seller.findOne({ name: 'iBucket' });

  const getData = async where => {
    const { data } = await factory.getAll(
      Product,
      {
        where,
        populateOptions: {
          path: 'seller',
          select: '-__v -createdAt -updatedAt',
        },
        isProduct: true,
      },
      false
    )(req, res, next);

    return data;
  };

  const { user } = req;
  let recommendedArr = [];

  if (user?.searchHistory?.length > 0) {
    const { keyword, resPerPage } = req.query;

    let a = [];
    let b = [];

    req.query.resPerPage = 3;
    if (user?.searchHistory?.[0]) {
      req.query.keyword = user?.searchHistory?.[0];

      a = await getData();
    }

    if (user?.searchHistory?.[1]) {
      req.query.keyword = user?.searchHistory?.[1];

      b = await getData();
    }

    recommendedArr = [...b, ...a];

    req.query.keyword = keyword;
    req.query.resPerPage = resPerPage || process.env.RESULTS_PER_PAGE;
  }

  const storeData = async variable => {
    variable.value = await getData(variable.condition);
  };

  const daraz = { condition: { seller: darazId } };
  const yayvo = { condition: { seller: yayvoId } };
  const goto = { condition: { seller: gotoId } };
  const iBucket = { condition: { seller: iBucketId } };

  const accessories = { condition: { ['category.search']: 'Accessories' } };
  const books = { condition: { ['category.search']: 'Books' } };
  const cameras = { condition: { ['category.search']: 'Cameras' } };
  const clothes = { condition: { ['category.search']: 'Clothes' } };
  const electronics = { condition: { ['category.search']: 'Electronics' } };
  const food = { condition: { ['category.search']: 'Food' } };
  const headphones = { condition: { ['category.search']: 'Headphones' } };
  const home = { condition: { ['category.search']: 'Home' } };
  const laptops = { condition: { ['category.search']: 'Laptops' } };
  const outdoor = { condition: { ['category.search']: 'Outdoor' } };
  const smartPhones = { condition: { ['category.search']: 'Smart Phones' } };
  const sports = { condition: { ['category.search']: 'Sports' } };

  await Promise.all([
    storeData(daraz),
    storeData(yayvo),
    storeData(goto),
    storeData(iBucket),
    storeData(accessories),
    storeData(books),
    storeData(cameras),
    storeData(clothes),
    storeData(electronics),
    storeData(food),
    storeData(headphones),
    storeData(home),
    storeData(laptops),
    storeData(outdoor),
    storeData(smartPhones),
    storeData(sports),
  ]);

  res.status(200).json({
    data: {
      ...(recommendedArr?.length > 0 && {
        recommended: {
          results: recommendedArr?.length,
          recommended: recommendedArr,
        },
      }),
      sellers: {
        daraz,
        yayvo,
        goto,
        iBucket,
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

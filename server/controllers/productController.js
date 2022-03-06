const Product = require('../models/product');
const Seller = require('../models/seller');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

exports.getProducts = factory.getAll(Product, {
  getTotalDocs: true,
  populateOptions: {
    path: 'seller',
    select: '-__v -createdAt -updatedAt',
  },
});

exports.getProduct = factory.getOne(Product, {
  path: 'seller',
  select: '-__v -createdAt -updatedAt',
});

exports.createProduct = factory.createOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.ProductId);

  if (!product) return next(new AppError('Product not found', 404));

  const { rating, review } = req.body;

  const isReviewd = product.reviews.some(rev => {
    if (rev.user === req.user.id) {
      rev.rating = rating;
      rev.review = review;
      return true;
    }
  });

  if (!isReviewd) product.reviews.push({ user: req.user.id, rating, review });

  product.numOfReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
    product.numOfReviews;

  await product.save();
});

exports.getReviews = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.ProductId);

  if (!product) return next(new AppError('Product not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      numOfreviews: product.numOfreviews,
      rating: product.rating,
      reviews: product.reviews,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  // const product = await Product.findById(req.params.ProductId);

  // console.log(product.reviews[0]);
  // console.log(product.reviews[1]);

  // if (!product) return next(new AppError('Product not found', 404));

  // // product.reviews = product.reviews.map(rev => {
  // product.reviews = Object.values(product.reviews).map(rev => {
  //   if (rev.user === req.user.id) return;

  //   return rev;
  // });

  // product.numOfReviews = product.reviews.length;

  // product.rating =
  //   Object.values(product.reviews).reduce((acc, rev) => acc + rev.rating, 0) /
  //   product.numOfReviews;
  // // product.rating =
  // //   product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
  // //   product.numOfReviews;

  // await product.save();

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     productRating: product.rating,
  //     numOfReviews: product.numOfReviews,
  //   },
  // });

  const product = await Product.findById(req.params.ProductId);

  const reviews = product.reviews.filter(
    review => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.params.ProductId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getHomePage = catchAsync(async (req, res, next) => {
  const { _id: darazId } = await Seller.findOne({ name: 'Daraz' });
  const { _id: yayvoId } = await Seller.findOne({ name: 'Yayvo' });
  // const { _id: gotoId } = await Seller.findOne({ name: 'Goto' });

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
  // const goto = await getData({ seller: gotoId });

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
        // goto,
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

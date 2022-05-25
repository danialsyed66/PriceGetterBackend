const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return new AppError('Document with id not found', 404);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!doc) return new AppError('Document with id not found', 404);

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

/*
Double Populate
{
  path: 'seller',
  select: '-__v -createdAt -updatedAt',
  populate: {
    path: 'user',
  },
}
*/
// populateOptions is an object with attributes: path and select
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError('Document with id not found', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, options = {}, sendRes = true) =>
  catchAsync(async (req, res, next) => {
    const { getTotalDocs, getOrderAmount, populateOptions, isProduct } =
      options;
    const {
      price: priceQuery,
      category: categoryQuery,
      seller: sellerQuery,
      onSale,
      discount: discountQuery,
      keyword,
    } = req.query;

    const { user } = req;

    if (isProduct && user && keyword) {
      const { searchHistory } = user;

      if (!searchHistory?.includes(keyword)) {
        user.searchHistory = [searchHistory?.[1], keyword];

        await user.save();
      }
    }

    const resPerPage = req.query.resPerPage || process.env.RESULTS_PER_PAGE;

    const price = {};
    if (priceQuery?.gte) price.$gte = +priceQuery.gte;
    if (priceQuery?.lte) price.$lte = +priceQuery.lte;
    if (price.$gte === 0) price.$gte = 1;

    const discount = {};
    if (onSale) discount.$gte = 1;
    if (discountQuery?.gte) discount.$gte = +discountQuery.gte;
    if (discountQuery?.lte) discount.$lte = +discountQuery.lte;
    if (discount.$gte === 0) discount.$gte = 1;

    let sellerArray = sellerQuery?.split(',').map(seller => seller?.trim());
    const getPriceGetter = sellerArray?.includes('PriceGetter');
    sellerArray = sellerArray?.filter(seller => seller !== 'PriceGetter');
    const sellers = sellerArray?.map(seller => ({ seller: seller?.trim() }));

    const categoryArray = categoryQuery?.split(',');
    const categories = categoryArray?.map(category => ({
      ['category.search']: category?.trim(),
    }));

    const orCondition = {
      $or: [
        ...(sellers ? [...sellers] : []),
        ...(categories ? [...categories] : []),
        ...(getPriceGetter ? [{ pricegetter: true }] : []),
      ],
    };

    const conditionExists = sellerQuery || categoryQuery;

    const where = options.where || {
      ...(price.$gte && { price }),
      ...(onSale && { discount }),
      ...(conditionExists && orCondition),
    };

    // Creating a query
    let apiFeatures = new ApiFeatures(
      Model.find(where),
      req.query,
      isProduct && 'images name price rating stock seller discount'
    )
      .search()
      .sort()
      .limitFields()
      .paginate(resPerPage);

    if (populateOptions) apiFeatures.query.populate(populateOptions);

    // Calling the query
    const docs = await apiFeatures.query;

    let numOfDocs = 0;
    if (getTotalDocs)
      numOfDocs = await new ApiFeatures(Model.find(where), req.query)
        .search()
        .sort()
        .limitFields()
        .query.countDocuments();

    let totalAmount = 0;
    if (getOrderAmount)
      docs.forEach(doc => {
        totalAmount += doc.totalPrice;
      });

    const data = {
      totalAmount: getOrderAmount && totalAmount,
      numOfDocs: getTotalDocs && numOfDocs,
      resPerPage: getTotalDocs && +resPerPage,
      data: docs,
    };

    if (!sendRes) return data;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data,
    });
  });

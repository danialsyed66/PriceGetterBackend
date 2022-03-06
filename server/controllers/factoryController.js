const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
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
    const { getTotalDocs, getOrderAmount, populateOptions, where } = options;
    const resPerPage = req.query.resPerPage || process.env.RESULTS_PER_PAGE;

    // Creating a query
    const apiFeatures = new ApiFeatures(Model.find(where), req.query)
      .search()
      .sort()
      .limitFields()
      .paginate(resPerPage);

    if (populateOptions) apiFeatures.query.populate(populateOptions);

    // Calling the query
    const docs = await apiFeatures.query;

    let numOfDocs = 0;
    if (getTotalDocs) numOfDocs = await Model.countDocuments(where);

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

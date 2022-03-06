const Order = require('../models/order');
const Product = require('../models/product');
const factory = require('./factoryController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const processItem = async (id, quantity) => {
  const product = await Product.findById(id);
  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
};

exports.getOrders = factory.getAll(Order, { getTotalDocs: true });
exports.getOrder = factory.getOne(Order, {
  path: 'user',
  select: 'name email',
});
exports.createOrder = factory.createOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === 'Delivered')
    return next(new AppError('Order has already been processed.', 400));

  order.orderItems.forEach(
    async item => await processItem(item.product, item.quantity)
  );

  order.deliveredAt = Date.now();
  order.orderStatus = req.body.orderStatus;

  await order.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.myOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

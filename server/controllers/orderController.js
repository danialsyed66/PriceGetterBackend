const Order = require('../models/order');
const Product = require('../models/product');
const factory = require('./factoryController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const processItem = async (id, quantity) => {
  const product = await Product.findById(id);

  const stock = +product.stock;
  product.stock = stock - quantity;

  await product.save({ validateBeforeSave: false });
};

exports.getOrders = factory.getAll(Order, { getTotalDocs: true });

exports.getOrder = factory.getOne(Order, {
  path: 'user',
  select: 'name email',
});

exports.deleteOrder = factory.deleteOne(Order);

exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    seller: orderItems[0].seller,
    orderItems: orderItems.map(item => ({
      ...item,
      image: item.images?.length && item.images[0].url,
      product: item._id,
      _id: undefined,
    })),
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  order.orderItems.forEach(
    async item => await processItem(item.product, item.quantity)
  );

  res.status(201).json({
    status: 'success',
    data: {
      data: order,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === 'Delivered')
    return next(new AppError('Order has already been processed.', 400));

  order.deliveredAt = Date.now();
  order.orderStatus = 'Delivered';

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

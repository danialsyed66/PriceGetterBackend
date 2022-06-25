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

const lessThan24Hrs = date => {
  if (!date) return true;

  const then = new Date(date);
  const now = new Date();

  const msBetweenDates = Math.abs(then.getTime() - now.getTime());

  // 👇️ convert ms to hours                  min  sec   ms
  const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);

  if (hoursBetweenDates < 24) return true;

  return false;
};

exports.requestRefund = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { message } = req.body;

  if (!message) return next(new AppError('Refund message is required.', 400));
  if (!orderId) return next(new AppError('Order Id is required.', 400));

  const order = await Order.findById(orderId);

  if (!order)
    return next(new AppError('Order with given id doesnot exist.', 404));

  if (order.user != req.user.id)
    return next(new AppError('This is not your order.', 400));

  const {
    refund: { status: refundStatus },
    deliveredAt,
  } = order;

  if (refundStatus === 'declined')
    return next(
      new AppError('Your refund request has already been declined.', 400)
    );

  if (refundStatus === 'accepted')
    return next(new AppError('Your payment has already been refunded.', 400));

  if (refundStatus === 'requested')
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Your refund is already in progress.',
      },
    });

  if (!lessThan24Hrs(deliveredAt))
    return next(
      new AppError('You cannot request refund after 24 hours of delivery.', 400)
    );

  order.refund.status = 'requested';
  order.refund.message = message;

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

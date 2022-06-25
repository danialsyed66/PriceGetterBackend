const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Order = require('../models/order');
const Seller = require('../models/seller');
const User = require('../models/user');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

exports.processPayment = catchAsync(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: req.body.currency || 'pkr',

    metadata: { integration_check: 'accept_a_payment' },
  });

  res.status(200).json({
    status: 'success',
    data: {
      clientSecret: paymentIntent.client_secret,
    },
  });
});

exports.refund = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { action, message } = req.body;

  if (!orderId) return next(new AppError('Order Id is required.', 400));

  const order = await Order.findById(orderId);

  if (!order) return next(new AppError('There is no order by this Id.', 404));

  if (order?.refund?.status === 'none')
    return next(new AppError('This order doesnot have a refund request.', 400));

  if (order?.refund?.status === 'accepted')
    return next(new AppError('Payment has already been refunded.', 400));

  const sellerId = order?.seller;
  const paymentId = order?.paymentInfo.id;

  if (!paymentId)
    return next(
      new AppError(
        'Payment Id is not found. Please ask admin to use Stripe Dashboard for refund.',
        400
      )
    );
  if (!sellerId)
    return next(
      new AppError(
        'Seller Id is not found. Please ask admin to use Stripe Dashboard for refund.',
        400
      )
    );

  const seller = await Seller.findById(sellerId);
  const userId = seller?.user;

  if (!seller || !userId)
    return next(
      new AppError(
        'Seller not found. Please ask admin to use Stripe Dashboard for refund.',
        400
      )
    );

  if (userId != req.user.id)
    return next(
      new AppError(
        'You are not registered as the seller of this order. Please ask admin to use Stripe Dashboard for refund.',
        400
      )
    );

  if (order.refund.status === 'declined')
    return next(new AppError('The refund has already been declined.', 400));

  if (order.refund.status === 'accepted')
    return next(new AppError('The refund has already been accepted.', 400));

  if (action === 'decline') {
    if (!message)
      return next(
        new AppError('Message is required to decline a refund.', 400)
      );

    order.refund.status = 'declined';
    order.refund.message = message;

    await order.save();

    return res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  }

  await stripe.refunds.create({
    payment_intent: paymentId,
  });

  order.refund.status = 'accepted';

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Your payment is refunded',
      order,
    },
  });
});

exports.sendStripeApiKey = (req, res, next) =>
  res.status(200).json({
    status: 'success',
    data: {
      stripeApiKey: process.env.STRIPE_PUBLISHER_KEY,
    },
  });

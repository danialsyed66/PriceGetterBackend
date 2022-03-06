const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');

exports.processPayment = catchAsync(async (req, res, next) => {
  console.log(stripe);
  console.log(stripe.paymentIntent);

  const paymentIntent = await stripe.paymentIntent.create({
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

exports.sendStripeApiKey = (req, res, next) =>
  res.status(200).json({
    status: 'success',
    data: {
      stripeApiKey: process.env.STRIPE_PUBLISHER_KEY,
    },
  });

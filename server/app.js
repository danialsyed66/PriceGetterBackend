const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fileupload = require('express-fileupload');
const passport = require('passport');
// Social Login
const cookieSession = require('cookie-session');

const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const orderRouter = require('./routes/orderRouter');
const paymentRouter = require('./routes/paymentRouter');
const postRouter = require('./routes/postRouter');
const sellerRouter = require('./routes/sellerRouter');

require('./passport')(passport);

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json({ encoded: true }));
app.use(fileupload());
// app.use(
//   hpp({
//     whitelist: [
//       'ratingsQuantity',
//       'ratingsAverage',
//       'duration',
//       'difficulty',
//       'price',
//     ],
//   })
// );

// Social Login
app.use(
  cookieSession({
    name: 'session',
    keys: ['google', 'facebook', 'github', 'auth', 'by', 'passportjs'],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Social Login
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/seller', sellerRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Given route ${req.originalUrl} doesnot exist`, 404));
});

app.use(errorController);

module.exports = app;

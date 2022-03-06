const AppError = require('../utils/appError');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const sendToken = require('../utils/sendToken');

exports.google = catchAsync((req, res, next) => {});

exports.success = (req, res) => {
  if (req.user) {
    res
      .status(200)
      .cookie('session', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .cookie('session.sig', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: 'successfull',
        user: req.user,
        //   cookies: req.cookies
      });
  }
};

exports.failed = (req, res) => {
  res.status(401).json({
    success: false,
    message: 'failure',
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
};

exports.saveUser = catchAsync(async (req, res, next) => {
  const { name, email, avatar, provider, socialId } = req.body;

  let user = await User.findOne({ email });

  if (user && !user.provider)
    return next(new AppError('User with email already exists', 401));

  if (!user)
    user = await User.create({
      name,
      email,
      provider,
      avatar,
      password: socialId,
    });

  sendToken(user, res, 200);
});

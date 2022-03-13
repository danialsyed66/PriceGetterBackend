const AppError = require('../utils/appError');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const sendToken = require('../utils/sendToken');

exports.success = (req, res) => {
  if (socialUser) {
    res.status(200).json({
      success: true,
      message: 'successfull',
      user: socialUser,
    });
  }
};

exports.clear = (req, res) => {
  socialUser = undefined;

  res.status(200).json({
    success: true,
    message: 'cleared',
  });
};

exports.failed = (req, res) => {
  res.status(401).json({
    success: false,
    message: 'failure',
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
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

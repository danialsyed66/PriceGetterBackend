const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendToken = require('../utils/sendToken');
const sendEmail = require('../utils/sendEmail');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, avatar, role } = req.body;

  let result;
  if (avatar)
    result = await cloudinary.v2.uploader.upload(avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar
      ? {
          public_id: result.public_id,
          url: result.secure_url,
        }
      : undefined,
    role: role === 'seller' ? 'seller-pending' : 'user',
  });

  sendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please enter email and password to login'), 401);

  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new AppError('Wrong email or password', 401));

  const passwordMatched = await user.comparePasswords(password);

  if (!passwordMatched)
    return next(new AppError('Wrong email or password', 401));

  sendToken(user, res, 201);
});

exports.logout = (req, res, next) => {
  res
    .status(200)
    .cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      status: 'success',
      message: 'Logged out',
    });
};

exports.auth = catchAsync(async (req, res, next) => {
  if (!req.cookies) return next(new AppError('You are not logged in.', 400));

  const { token } = req.cookies;

  if (!token) return next(new AppError('You are not logged in.', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) return next(new AppError('User not found', 401));

  req.user = currentUser;

  next();
});

exports.authTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();

    next(new AppError('You are not authorized.', 403));
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email)
    return next(new AppError('Please provide a valid email address.', 400));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User with email does not exist.', 404));

  const resetToken = user.forgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const options = {
    email,
    subject: 'Password recovery email',
    message: `Have you forgoten your Natours password?
    
    Here is the link to reset your password:
    
    ${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}
    
    If you have not requested to reset password please ignore this email.`,
  };

  try {
    await sendEmail(options);

    res.status(200).json({
      status: 'success',
      message: 'Password recovory email sent.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTimeout = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError(err.message, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTimeout: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new AppError('Token is not valid or has expired. Please try again.', 400)
    );

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(new AppError('Please enter your password.', 400));

  if (password !== confirmPassword)
    return next(new AppError('Passwords donot match.', 400));

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTimeout = undefined;

  await user.save();

  sendToken(user, res, 201);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword, oldPassword } = req.body;

  if (!password || !confirmPassword || !oldPassword)
    return next(
      new AppError(
        'Please enter your password, confirm password and old password',
        400
      )
    );

  if (password !== confirmPassword)
    return next(new AppError('Your passwords do not match', 400));

  const user = await User.findById(req.user.id).select('+password');

  const isMatched = await user.comparePasswords(oldPassword);

  if (!isMatched)
    return next(new AppError('Your old password is incorrect', 400));

  user.password = password;
  await user.save();

  sendToken(user, res, 200);
});

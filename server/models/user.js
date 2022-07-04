const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      maxlength: [35, 'Name should be less than 35 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Please enter a valid email'],
      maxlength: [35, 'Email should be less than 35 characters'],
      unique: [true, 'Email already exists'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password should be at least 6 characters'],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    verification: {
      public_id: String,
      url: String,
    },
    favourites: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'seller', 'seller-pending'],
        message: 'Please enter a valid role',
      },
      default: 'user',
    },
    passwordResetToken: String,
    passwordResetTimeout: Date,
    provider: String,
    searchHistory: [{ type: String }],
  },
  { timestamps: true }
);

Schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

Schema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

Schema.methods.comparePasswords = function (givenPassword) {
  return bcrypt.compare(givenPassword, this.password);
};

Schema.methods.forgotPasswordToken = function () {
  // const token = crypto.randomBytes(20).toString('hex');
  const otp = crypto.randomInt(999999);

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(`${otp}`)
    .digest('hex');

  this.passwordResetTimeout = new Date(Date.now() + 30 * 60 * 1000);

  return otp;
};

const model = mongoose.model('User', Schema);

module.exports = model;

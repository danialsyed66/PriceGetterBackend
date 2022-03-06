const mongoose = require('mongoose');

const CATEGORIES = [...require('../utils/categories')];

CATEGORIES.push('');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price should not be a negative number'],
    },

    oldPrice: {
      type: Number,
      min: [0, 'Price should not be a negative number'],
    },
    shippingCost: {
      type: Number,
      min: [0, 'Shipping Cost should not be a negative number'],
      default: 0,
    },
    description: {
      type: String,
      // required: [true, 'Product description is required'],
      default: function () {
        return this.name;
      },
    },
    rating: {
      type: Number,
      min: [0, 'Rating should not be a negative number'],
      max: [5, 'Rating cannot be greater than 5'],
      default: 0,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    category: {
      search: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
          values: CATEGORIES,
          message: `Please Select a category from ${CATEGORIES.join(', ')}.`,
        },
      },
      head: String,
      sub: String,
      base: String,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Please enter product seller'],
    },
    stock: {
      type: String,
      required: [true, 'Product stock information is required'],
      default: 'In Stock',
    },
    noOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          required: [true, 'Rating is required for product review'],
          min: [0, 'Rating should not be a negative number'],
          max: [5, 'Rating cannot be greater than 5'],
        },
        review: {
          type: String,
          // required: [true, 'Review is required for product review'],
        },
      },
    ],
    url: String,
    discount: String,
    brand: String,
    installment: String,
  },
  { timestamps: true }
);

const Model = mongoose.model('Product', schema);

module.exports = Model;

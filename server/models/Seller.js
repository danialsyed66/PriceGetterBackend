const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Seller name is required'],
    },
    url: {
      type: String,
      required: [true, 'Seller url is required'],
      default: function () {
        return `${process.env.CLIENT_URL}seller/${this['_id']}`;
      },
    },
    logo: {
      url: { type: String, required: true },
      public_id: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Model = new mongoose.model('Seller', schema);

module.exports = Model;

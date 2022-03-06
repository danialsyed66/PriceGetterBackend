const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Body text is required for post'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    avatar: String,
    name: String,
    images: [
      {
        url: { type: String, required: true },
        public_id: String,
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        type: new mongoose.Schema(
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            text: {
              type: String,
              required: [true, 'Body text is required for comment'],
            },
            avatar: String,
            name: String,
            images: [
              {
                url: { type: String, required: true },
                public_id: String,
              },
            ],
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

const Model = mongoose.model('Post', schema);

module.exports = Model;

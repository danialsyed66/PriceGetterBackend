const mongoose = require('mongoose');

const schema = mongoose.Schema({
  startTime: Date,
  darazTime: Number,
  yayvoTime: Number,
  gotoTime: Number,
  totalTime: Number,
  error: { position: String, stack: String },
  htmls: [{ html1: String, html: String }],
});

const Model = mongoose.model('Log', schema);

module.exports = Model;

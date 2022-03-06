const mongoose = require('mongoose');

const schema = new mongoose.Schema();

const Model = mongoose.model('Seller', schema);

module.exports = Model;

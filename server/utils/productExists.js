const Product = require('../models/Product');

module.exports = async url => {
  const product = await Product.findOne({ url });

  if (!product) return false;

  return true;
};

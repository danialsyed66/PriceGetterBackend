const Product = require('../models/Product');

module.exports = async products => {
  products.forEach(async (product, i) => {
    try {
      if (!product.name) return;

      const prod = await Product.findOne({
        url: product.url,
        seller: product.seller,
      });

      if (!prod) {
        return await Product.create(product);
      }

      await Product.findByIdAndUpdate(prod.id, product, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
    } catch (err) {
      console.log(i);
    }
  });
  console.log('done');

  // if (products.length) {
  // await Product.deleteMany();
  // await Product.create(products);
  // }
};

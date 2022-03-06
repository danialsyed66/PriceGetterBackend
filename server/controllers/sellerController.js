const cloudinary = require('cloudinary');

const Seller = require('../models/seller');
const Product = require('../models/product');
const catchAsync = require('../utils/catchAsync');

exports.createSeller = catchAsync(async (req, res, next) => {
  const { name, url, logo, user } = req.body;

  let result;
  if (logo)
    result = await cloudinary.v2.uploader.upload(logo, {
      folder: 'logos',
      width: 150,
      crop: 'scale',
    });

  const seller = await Seller.create({
    name,
    url,
    logo: logo
      ? {
          public_id: result.public_id,
          url: result.secure_url,
        }
      : {
          url: 'https://res.cloudinary.com/dlwaao9wl/image/upload/v1646261104/avatars/dykfln0kprkc6dwcrmm3.png',
        },
    user,
  });

  res.status(201).json({
    status: 'success',
    data: {
      seller,
    },
  });
});

exports.sellerSeeder = catchAsync(async (req, res, next) => {
  const daraz = await Seller.findOne({ name: 'Daraz' });
  // const goto = await Seller.findOne({ name: 'Goto' });
  const yayvo = await Seller.findOne({ name: 'Yayvo' });

  const products = await Product.count();
  const darazProducts = await Product.count({ seller: daraz._id });
  const yayvoProducts = await Product.count({ seller: yayvo._id });
  const otherProducts = await Product.find({
    $and: [{ seller: { $ne: yayvo._id } }, { seller: { $ne: daraz._id } }],
  });
  // console.log(otherProducts);

  // products.forEach(async (product, i) => {
  //   if (product.seller === 'Daraz') product.seller = daraz._id;
  //   if (product.seller === 'Yayvo') product.seller = yayvo._id;

  //   await product.save({ validateBeforeSave: false });
  //   console.log(i);
  // });

  res.status(200).json({
    status: 'success',
    data: {
      products,
      products,
      darazProducts,
      yayvoProducts,
      otherProducts,
      // daraz,
      // goto,
      // yayvo,
    },
  });
});

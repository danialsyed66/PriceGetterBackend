const User = require('../models/user');
const Seller = require('../models/seller');
const factory = require('./factoryController');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = factory.getAll(User, {
  where: {
    role: 'user',
  },
});
exports.getAllSellers = factory.getAll(User, {
  where: {
    role: 'seller',
  },
});
exports.getPendingSellers = factory.getAll(User, {
  where: {
    role: 'seller-pending',
  },
});
exports.getUserById = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.sellerAction = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const role = req.body.action === 'approve' ? 'seller' : 'user';
  const seller = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!seller) return new AppError('Seller with id not found', 404);

  if (role !== 'seller')
    return res.status(200).json({
      status: 'success',
      data: { user: seller },
    });

  const sellert = await Seller.create({
    name: seller.name,
    url: `https://price-getter.netlify.app/seller/${seller._id}`,
    logo: {
      url: 'https://res.cloudinary.com/dlwaao9wl/image/upload/v1653167546/logos/ilfvq5tta1q6ibccxqg4.png',
    },
    user: seller._id,
  });

  if (role !== 'seller')
    return res.status(200).json({
      status: 'success',
      data: { user: seller, seller: sellert },
    });
});

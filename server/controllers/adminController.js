const User = require('../models/user');
const factory = require('./factoryController');

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

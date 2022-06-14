const userRouter = require('../routes/userRouter');
const adminRouter = require('../routes/adminRouter');
const authRouter = require('../routes/authRouter');
const productRouter = require('../routes/productRouter');
const orderRouter = require('../routes/orderRouter');
const paymentRouter = require('../routes/paymentRouter');
const postRouter = require('../routes/postRouter');
const sellerRouter = require('../routes/sellerRouter');

const getInfo = (basePath, router) => {
  const array = router.stack;

  let route,
    routes = [];

  array.forEach(element => {
    if (element.route)
      return routes.push({
        path: basePath + element.route?.path,
        methods: element.route?.methods,
      });

    if (element.name !== 'router') return;

    element?.handle?.stack.forEach(handle => {
      route = handle?.route;
      route &&
        routes.push({
          path: basePath + route.path,
          methods: route.methods,
        });
    });
  });

  return routes;
};

exports.routesInfo = (req, res, nex) => {
  const routes = [];

  routes.push(...getInfo('/api/v1', userRouter));
  routes.push(...getInfo('/api/v1/admin', adminRouter));
  routes.push(...getInfo('/api/v1/auth', authRouter));
  routes.push(...getInfo('/api/v1/products', productRouter));
  routes.push(...getInfo('/api/v1/orders', orderRouter));
  routes.push(...getInfo('/api/v1/payment', paymentRouter));
  routes.push(...getInfo('/api/v1/posts', postRouter));
  routes.push(...getInfo('/api/v1/seller', sellerRouter));

  res.status(200).json({
    status: 'success',
    data: {
      result: routes.length,
      routes,
    },
  });
};

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');

const Product = require('./models/product');

dotenv.config({ path: 'server/config.env' });

global.socialUser = undefined;

const app = require('./app');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!!! 💥');
  console.log(err.name, ': ', err.message);
  console.log(err.stack);
  console.log(`Shutting down the server due to an uncaught exception`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () =>
  console.log(
    `Listening on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  )
);

mongoose
  .connect(process.env.DB_ATLAS_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(con =>
    console.log(`Connected to MongoDB Host: ${con.connection.host}...`)
  )
  .then(async () => {
    // const prods = await Product.find({ discount: '' });
    // console.log(prods.length);
    // for (let index = 0; index < prods.length; index++) {
    //   console.log(index);
    //   const prod = prods[index];
    //   if (prod.discount === '' || !prod.discount) prod.discount = 0;
    //   await prod.save({ validateBeforeSave: false });
    // }
    // console.log('Done');
  });

process.on('unhandledRejection', err => {
  console.log('UNCAUGHT REJECTION!!! 💥');
  console.log(err.name, ': ', err.message);
  console.log(err.stack);
  console.log('Shutting down server due to unhandled rejection');

  process.exit(1);
});

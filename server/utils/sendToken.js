module.exports = sendToken = (user, res, statusCode) => {
  try {
    const token = user.getJWT();

    user.password = undefined;
    user.__v = undefined;

    // .cookie('token', token, {
    //   expires: new Date(
    //     Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    //   ),
    //   httpOnly: true,
    // })

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    throw err;
  }
};

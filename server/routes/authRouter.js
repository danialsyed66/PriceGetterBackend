const passport = require('passport');
const router = require('express').Router();

const {
  success,
  failed,
  clear,
  logout,
  saveUser,
} = require('../controllers/socialAuthController');

router.get('/login/success', success);

router.get('/login/clear', clear);

router.get('/login/failed', failed);

router.get('/logout', logout);

router.post('/saveUser', saveUser);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['profile', 'email'] })
);
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get('/twitter', passport.authenticate('twitter'));
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

module.exports = router;

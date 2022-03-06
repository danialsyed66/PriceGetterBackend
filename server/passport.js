const googleStrategy = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const twitterStrategy = require('passport-twitter').Strategy;

module.exports = passport => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      (_, __, profile, done) => {
        done(null, profile);
      }
    )
  );

  passport.use(
    new facebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/auth/facebook/callback',
      },
      (_, __, profile, done) => {
        done(null, profile);
      }
    )
  );

  // passport.use(
  //   new twitterStrategy(
  //     {
  //       clientID: process.env.TWITTER_CLIENT_ID,
  //       clientSecret: process.env.TWITTER_CLIENT_SECRET,
  //       callbackURL: '/auth/twitter/callback',
  //     },
  //     (_, __, profile, done) => {
  //       done(null, profile);
  //     }
  //   )
  // );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

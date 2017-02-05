'use strict';

/**
 * 生产环境配置
 */

module.exports = {
  db: process.env.MONGOHQ_URL,
  facebook: {
    clientID: process.env.FACEBOOK_CLIENTID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: 'http://nodejs-express-demo.herokuapp.com/auth/facebook/callback'
  },

  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://nodejs-express-demo.herokuapp.com/auth/github/callback'
  },
  google: {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'http://nodejs-express-demo.herokuapp.com/auth/google/callback'
  }
};
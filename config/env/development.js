'use strict';

/**
 * 开发环境配置参数
 */

module.exports = {
  db: 'mongodb://localhost/noobjs_dev',  //
  facebook: {
    clientID: process.env.FACEBOOK_CLIENTID,  //这是添加的环境变量
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  google: {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }
};
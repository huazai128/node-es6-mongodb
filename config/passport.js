const mongoose = require("mongoose");
const User = mongoose.model("User");

const local = require("./passport/local");  //自定义用户登录验证
const facebook = require("./passport/facebook");  //使用facebook登录验证策略
const github = require("./passport/github");
const weixin = require("./passport/weixin");
const qq = require("./passport/qq");
//const google = require("./passport/google");



//passport：第三方登录策略
module.exports = function(passport){
    //序列化seeison和反序列化session
    passport.serializeUser((user,cb) => cb(null,user.id));
    passport.deserializeUser((id,cb) => User.load({ criteria: { _id: id } },cb));

    //调用local策略登录
    passport.use(local);
    passport.use(facebook);
    passport.use(github);
    passport.use("loginByWeixin",weixin.loginByWeixin);//扫码登录
    passport.use("loginByWeixinClient",weixin.loginByWeixinClient); //客户端登录
    passport.use(qq);
    //passport.use(google);
}

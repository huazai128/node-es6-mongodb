const mongoose = require("mongoose");
const WeixinStrategy = require("passport-weixin");
const User = mongoose.model("User");

//使用微信扫码登录；
exports.loginByWeixin = new WeixinStrategy({
    clientID:"开发者clientID",
    clientSecret:"开发者clientSecret",
    callbackURL:"http://localhost:3000/auth/weixin/callback",
    requireState:false,
    scope:'snsapi_login'
},function(accessToken, refreshToken, profile, done){
    const options = {
        criteria:{"weixin.id":profile.id}
    }
    User.load(options,function(err,user){ //
        if(err) return done(err);
        if(!user){  
            user = new User({
                name: profile.displayName,
                email:profile.emails[0].value,
                username:profile.username,
                provider:"weixin",
                weixin:profile._json
            })
            user.save(function(err){
                if(err) console.log(err);
                return done(err,user)
            })
        }else{
            return done(err,user)
        }
    })
});

//使用微信客服端登录
exports.loginByWeixinClient = new WeixinStrategy({
    clientID:"开发者clientID",
    clientSecret:"开发者clientSecret",
    callbackURL:"http://localhost:3000/auth/weixinclient/callback",
    requireState:false,
    authorizationURL:"https://open.weixin.qq.com/connect/oauth2/authorize",
    scope:'snsapi_userinfo'
},function(accessToken, refreshToken, profile, done){
    const options = {
        criteria:{"weixin.id":profile.id}
    }
    User.load(options,function(err,user){ //
        if(err) return done(err);
        if(!user){  
            user = new User({
                name: profile.displayName,
                email:profile.emails[0].value,
                username:profile.username,
                provider:"weixin",
                weixin:profile._json
            })
            user.save(function(err){
                if(err) console.log(err);
                return done(err,user)
            })
        }else{
            return done(err,user)
        }
    })
})
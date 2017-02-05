const mongoose = require("mongoose");
const User = mongoose.model("User");
const FacebookStrategy = require("passport-facebook").Strategy;
const config = require("../");

module.exports = new FacebookStrategy({
    clientID:config.facebook.clientID,   //开发者个人facebook clientID
    clientSecret:config.facebook.clientSecret, 
    callbackURL:config.facebook.callbackURL
},function(accessToken, refreshToken, profile, done){  //获取facebook用户信息和token
    console.log(accessToken);
    console.log(profile);
    const options = {
        criteria:{
            'facebook.id':profile.id
        }
    }
    User.load(options,function(err,user){
        if(err) return done(err);
        if(!user){ //如果用户没有使用过facebook登录，就保存用户状态
            user = new User({
                name: profile.displayName,
                email:profile.emails[0].value,
                username:profile.username,
                provider:"facebook",
                facebook:profile._json
            })
            user.save(function(err){ //保存用户
                if(err) console.log(err);
                return done(err,user);
            })
        }else{
            return done(err,user);
        }
    })
})
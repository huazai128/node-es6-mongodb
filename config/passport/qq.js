const mongoose = require("mongoose");
const QQStrategy = require("passport-qq").Strategy;
const User = mongoose.model("User");

module.exports = new QQStrategy({
    clientID:"开发者clientID",
    clientSecret:"开发着clientSecret",
    callbackURL:"http://localhost/auth/qq/callback"
},function(accessToken, refreshToken, profile, done){
    const options = {
        criteria:{"qq.id":profile.id}
    };
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

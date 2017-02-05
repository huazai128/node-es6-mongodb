const mongoose = require("mongoose");
const GithubStrategy = require("passport-github").Strategy;
const User = mongoose.model("User");
const config = require("../");

module.exports = new GithubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL
},function(accessToken, refreshToken, profile, done) {
    const options = {
        criteria:{"github.id":parseInt(profile.id)}
    }
    User.load(options,function(err,user){
        if(err) return done(err);
        if(!user){//如果user不存在；
            user = new User({
                name:profile.displayName,
                email:profile.emails[0].value,
                username:profile.username,
                provider:"github",
                github:profile._json
            })
            user.save(function(err){
                if(err) console.log(err);
                return done(err,user);
            })
        }else{
            return done(err,user);
        }
    })
})
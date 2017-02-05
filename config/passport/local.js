/**
 * Modul依赖
 * 
 */
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;//使用Local策略,进行登录
const User = mongoose.model("User");


//配置local策略登录
module.exports = new LocalStrategy({
    usernameField:"email",  //
    passwordField:"password"
},function(email,password,done){//获取用户登录参数；
    const options = {
        criteria:{email:email},
        select:"name username email hashed_password salt"//强制显示字段，其它的不显示；
    }
    User.load(options,function(err,user){
        
        if(err) return done(err);
        //用户不在
        if(!user){
            return done(null,false,{message:"用户不存在"})
        }
        if(!user.authenticate){ // 在Schema中定义的方法；用于判断密码是否一致；
            return done(null,false,{message:"用户名或密码错误"})
        }
        return done(null,user)
    })
})

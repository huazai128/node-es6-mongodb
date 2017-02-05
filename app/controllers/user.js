const mongoose = require("mongoose");
const { wrap:async } = require("co");//co模块：是co函数接受一个Generator函数，返回一个Promise对象
const { respond } = require("../utils"); //用于返回数据形式；一种事模版渲染页面，一个是json数据返回
const User = mongoose.model("User");//定义的UserSchema，追加到model中可以调用

//load加载;
//co模块；接受一个generator函数，返回一个promise对象;next:可以传递错误
exports.load = async(function* (req,res,next,_id){ // 判断用户是否存在
    const criteria = { _id };  //没理解
    try {
        req.profile = yield User.load({criteria});//
        if(!req.profile) return next(new Error("没有找到用户"));
    } catch (error) {
        return next(error)
    }
    next();//执行下个路由
})  

//GET注册
exports.signup = function(req,res){
    res.render("users/signup",{
        title:"Sign up",
        user: new User()  //空对象
    })
}

//POST注册；async函数，使用try，catch来捕获异常
exports.create = async(function* (req,res){
    let data = req.body;
    //console.log(data);
    let user = new User(data);
    user.provider = "local";
    try {
        yield user.save();
        req.logIn(user,err => {
            if(err) req.flash("info","不能登录");
            return res.redirect("/");
        })
    } catch (error) {
        const errors = Object.keys(error.errors) //keys用于获取对象中所有的key，map遍历所有的key
        .map(field => error.errors[field].message);
        console.log(errors);
        //注册
        res.render("users/signup",{
            title:"Sign up",
            errors,
            user
        })
    }
})


//GET登录
exports.login = function(req,res){
    res.render("users/login",{
        title:"Login",
    })
}

//POST登录
exports.session = login;  //passport-local策略登录；

//Login
function login(req,res){
    const redirectTo = req.session.returnTo ? req.session.returnTo : "/";
    //console.log(req)
    delete req.session.returnTo;
    res.redirect(redirectTo);
}

//退出
exports.logout = function(req,res){
    req.logout(); //不太懂怎样删除用户信息？
    res.redirect("/login");
}

//显示用户信息
exports.show = function(req,res){
    const user = req.profile;
    
    respond(res,"users/show",{
        title:user.name,
        user:user
    })
}

exports.signin = function(){};


exports.authCallback = login;


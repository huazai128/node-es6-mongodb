const express = require("express");
const session = require("express-session");
const compression = require("compression");   //用于中间件的压缩和静态文件的压缩，增加网页的访问速度
const logger = require("morgan");             //打印日志
const cookieParser = require("cookie-parser"); 
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");   //用于处理POST请求JSON参数解析
const methodOverride = require("method-override"); //提供一个类似的RESTAPI的方法来处理前后端请求；
const csrf = require("csurf");  //防止跨站请求伪造，防止csrf攻击；
const cors = require("cors");  //解决跨域问题
const upload = require("multer")(); //文件上传
const path = require("path");

const MongoStore = require("connect-mongo")(session);  //session存储
const flash = require("connect-flash");    //flash。要放在session后面
const winston = require("winston");        //日志打印
const helpers = require("view-helpers");   //
const config = require("./");              //不同环境下的配置
const pkg = require("../package.json");    //

const env = process.env.NODE_ENV || "development";//node环境


module.exports = function(app,passport){
    //用于中间件的压缩，必须顶置；
    app.use(compression({
        threshold:512  //限制大小为512；
    }))
    app.use(cors());   //解决跨域问题

    //静态文件的设置
    app.use(express.static(config.root + "/public"));

    //日志打印
    let log = "dev";
    if(env !== "development"){ //判断node环境，如果env不等于dev
        log = {
            stream:{
                write:message => winston.info(message) //输出日志xinxi
            }
        }
    }

    //判断环境是否为测试
    if(env !== "test") app.use(logger(log));

    //配置模版引擎
    app.set('views', config.root + "/app/views");
    app.set('view engine', 'jade');

    //提供一些属性，可以在页面直接调用
    app.use(function(req,res,next){
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();  //执行下一步操作
    })

    app.use(bodyParser.json()); //只接受json格式的数据
    app.use(bodyParser.urlencoded({extended:true}));//
    app.use(upload.single("image"));   //signle:只接受image名字的附件
    app.use(methodOverride(function(req){  //添加新的请求方法。如PUT、DELETE等方法
        if(req.body && typeof req.body === "object" && "_method" in req.body){ //typeof：判断属性指的类型；in：判断属性是否存在当前对象中，
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    //设置cookie和session存储
    app.use(cookieParser());
    app.use(cookieSession({secret:"secret"}));  //防止cookie被窃取
    app.use(session({  //session缓存；
        resave:false,
        saveUninitialized:true,
        secret:pkg.name,
        store: new MongoStore({
            url: config.db,
            collection : 'sessions'
        })
    }));

    //passport身份验证
    app.use(passport.initialize()); // 初始化passport身份验证
    app.use(passport.session());    // session回话

    app.use(flash());
    app.use(helpers(pkg.name));

    //不是测试环境下，在开发和生产环境下使用；
    if(env !== "test"){
        app.use(csrf()); //防止跨站请求伪造，防止csrf攻击；
        app.use(function(req,res,next){
            //console.log(req.csrfToken());  //req:请求中含有csrfToken();
            res.locals.csrf_token = req.csrfToken() //locals:直接在页面访问，能否在前后端
            next();
        })
    }
    //开发环境

    if(env === "development"){
        app.locals.prtty = true;
    }
}
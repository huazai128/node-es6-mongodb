require("dotenv").config();  //dotenv：必须配置到最顶部,用于环境变量的加载，添加新的环境变量；
/**
 * VS编辑器支持es6特性
 */
const express = require("express");
const fs = require("fs");   //文件系统
const join = require("path").join;
const mongoose = require("mongoose");
const passport = require("passport");     //身份验证策略；
const config = require("./config");
mongoose.Promise = require("bluebird");

const models = join(__dirname,"app/models")
const port = process.env.PORT || 3000;
const app = express();

module.exports = app;

//同步读取文件目录;引入所有的modules文件
fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))  //过滤掉不是js文件
    .forEach(file => require(join(models,file)))  //导入modelsxia所有的文件


require("./config/passport")(passport); //passsport：配置
require("./config/express")(app,passport);
require("./config/router")(app,passport)



connect()
    .on("error",console.log)
    .on("disconnected",connect)
    .on("open",listen);

//端口号
function listen(){
    app.listen(port);
    console.log('Express app started on port ' + port);
}

//链接数据库
function connect(){
    var options = {server: {socketOptions:{keeplive:1}}};
    return mongoose.connect("mongodb://localhost/node",options).connection;//返回mongodb
}






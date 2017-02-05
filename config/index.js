const path = require("path");
const extend = require("util")._extend; //工具模块，实现继承

//根据开发环境进行配置
const development = require("./env/development");
const test = require("./env/test");
const production = require("./env/productions")

const notifier = {
    service:"postmark",
    APN:false,
    email:true,
    actions:["comment"],
    tplPath:path.join(__dirname,"..","app/mailer/templates"),
    key:"POSTMARk_KEY"
}

const defaults = {
    root:path.join(__dirname,".."),
    notifier:notifier
}

//导出类似app[data]：data是个变量
module.exports = {
    development:extend(development,defaults),  //extend:用于对象的继承
    test: extend(test,defaults),
    production: extend(production,defaults)
}[process.env.NODE_ENV || 'development']; //根据环境变量来获取环境变量属性
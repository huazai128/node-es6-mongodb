const Notifier = require("notifier");   //模块的作用：
const jade = require("jade");
const config = require("../../config");

/**
 * 在Notifier圆形定义一个方法
 */
Notifier.prototype.processTemplate = function(tplPath,locals){
    locals.filename = tplPath;
    return jade.renderFile(tplPath,locals);
}

/**
 * 导出
 */
module.exports = {
    comment:function(options,cd){
        const article = options.article;
        const author = article.user;
        const user = options.currentUser;
        const notifier = new Notifier(config.notifier);
        const obj = {
            to:author.email,
            from:"your@product",
            subject:user.name + "added a comment on your article" +  article.title,
            alert:user.name + 'says :"' + options.comment,
            locals:{
                to:author.name,
                from: user.name,
                body:options.comment,
                article:article.name
            }
        }
        try{
            notifier.send("comment",obj,cd);
        }catch(err){
            console.log(err);
        }
    }
}
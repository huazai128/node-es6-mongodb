const Notifier = require("notifier");   //模块的作用：
const jade = require("jade");           //模版引擎
const config = require("../../config");

/**
 * 在Notifier原型定义一个方法
 */
Notifier.prototype.processTemplate = function (tplPath, locals) {
  locals.filename = tplPath;
  return jade.renderFile(tplPath, locals);
};

/**
 * 导出
 */
module.exports = {
    comment: function (options, cb) {
        const article = options.article;
        const author = article.user;
        const user = options.currentUser;
        const notifier = new Notifier(config.notifier);

        const obj = {
        to: author.email,
        from: 'your@product.com',
        subject: user.name + ' added a comment on your article ' + article.title,
        alert: user.name + ' says: "' + options.comment,
        locals: {
            to: author.name,
            from: user.name,
            body: options.comment,
            article: article.name
        }
        };

        try {
            notifier.send('comment', obj, cb);
        } catch (err) {
            console.log(err);
        }
    }
}
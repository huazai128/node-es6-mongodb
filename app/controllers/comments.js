const { wrap:async } = require("co");
const { respondOrRedirect } = require("../utils");

//初始化加载评论
exports.load = function(req,res,next,id){
    req.comment = req.article.comments   
        .find(comment => comment.id === id);
    if(!req.comment) return next(new Error("没有找到评论"));
    next();
}


//创建评论

exports.create = async(function*(req,res){
    const article = req.article;  //评论的文章
    yield article.addComment(req.user,req.body); //添加评论，获取当前评论用户信息和评论
    
    respondOrRedirect({req,res},`/articles/${article._id}`,article.comments[0]);
});

//删除评论
exports.delete = async(function*(req,res){
    yield req.article.removeComment(req.params.commentId);  //params:获取路由参数
    req.flash("info","删除成功");
    req.redirect("/articles/"+req.article.id);
    console.log(req.article.id);
    respondOrRedirect({ req, res }, `/articles/${req.article.id}`, {}, {
    type: 'info',
    text: 'Removed comment'
  });
})
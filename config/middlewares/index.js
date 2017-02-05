
/**
 * 用于判断用户是否登录，
 */
exports.requiresLogin = function(req,res,next){
    console.log(req); //req:包含的信息
    if(req.isAuthenticated()) return next();  //如果登录返回，继续进行往下的操作
    console.log(req.originalUrl);
    if(req.method == "GET") req.session.returnTo = req.originalUrl;  //
    res.redirect("/login"); //重定向登录
}

/**
 * 用户登录验证
 */
exports.user = {
    hasAuthorization:function(req,res,next){
        console.log(req.profile.id);
        if(req.profile.id != req.user.id){
            req.flash("info","");
            return req.redirect("/users/"+req.profile.id);
        }
        next();
    }
}
//文章操作权限验证
exports.article = {
    hasAuthorization:function(req,res,next){
        if(req.article.user.id != req.user.id){
            req.flash("info","");
            return res.redirect("/articles/"+req.article.id);
        }
        next();
    }
}

/**
 * 评论权限验证
 */
exports.comment = {
    hasAuthorization:function(req,res,next){
        if(req.user.id === req.comment.user.id ||  req.user.id === req.article.user.id){
            next();
        }else{
            req.flash('info', 'You are not authorized');
            res.redirect('/articles/' + req.article.id);
        }
    }
}
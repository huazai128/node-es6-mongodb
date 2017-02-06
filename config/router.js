const users = require("../app/controllers/user");
const articles = require("../app/controllers/articles");
const comments = require("../app/controllers/comments");
const tags = require("./app/controllers/tags");

const auth = require("./middlewares/index");


const articleAuth = [auth.requiresLogin,auth.article.hasAuthorization];  //对文章操作权限
const commentAuth = [auth.requiresLogin,auth.comment.hasAuthorization];  //对评论操作权限
const fail = { //不满足权限操作，重定向到登录页面
    failureRedirect:"/login"
}

module.exports = function(app,passport){

    const pauth = passport.authenticate.bind(passport);//passport：使用passport实现验证登录
    //GET登录
    app.get("/login",users.login);
    //退出
    app.get("/logout",users.logout);
    //GET注册
    app.get("/signup",users.signup);
    //POST注册
    app.post("/users",users.create);
    //POST登录，使用时passport-local策略登录
    app.post("/users/session",
        pauth("local",{  //访问local，在localjs中定义
            failureRedirect:"/login",  //配置登录失败重定向到登录页面
            failureFlash:"Email或密码输入错误",//提示信息
        }),users.session);
    //使用facebook登录;
    app.get("/auth/facebook",pauth("facebook",{
        scope:["email","user_about_me"],
        failureRedirect:"/login"//登录失败重定向到登录页面
    }),users.signin);
    app.get("/auth/facebook/callback",pauth("facebook",fail),users.authCallback);
    //使用Github登录验证
    app.get("/auth/github",pauth("github",fail),users.signin);
    app.get("/auth/github/callback",pauth("github",fail),users.authCallback);
    //使用微信登录验证
    app.get("/auth/loginByWeixin",pauth("loginByWeixin",{ successRedirect: '/articles',failureRedirect: '/login' }));
    app.get("/auth/loginByWeixinClient",pauth("loginByWeixinClient",{ successRedirect: '/articles',failureRedirect: '/login' }));
    //使用qq登录验证
    app.get("/auth/qq",pauth("qq",fail),users.signin);
    app.get("/auth/qq/callback",pauth("qq",fail),users.authCallback);

    //使用google登录验证
    // app.get('/auth/google',
    // pauth('google', {
    //   failureRedirect: '/login',
    //   scope: [
    //     'https://www.googleapis.com/auth/userinfo.profile',
    //     'https://www.googleapis.com/auth/userinfo.email'
    //   ]
    // }), users.signin);
    // app.get('/auth/google/callback', pauth('google', fail), users.authCallback);

    //get显示用户信息
    app.get("/users/:userId",users.show);
    
    app.param("userId",users.load);

    //根据ID初始化加载文章数据
    app.param("id",articles.load);
    //articles列表
    app.get("/articles",articles.index);
    //GET新建文章，判断用户是否登录
    app.get("/articles/new",auth.requiresLogin,articles.new);
    //POST新建文章
    app.post("/articles",auth.requiresLogin,articles.create);
    //显示详情
    app.get("/articles/:id",articles.show);
    //GET方法获取ID来修改文章,要先通过验证
    app.get("/articles/:id/edit",articleAuth,articles.edit);
    //POST方法更新文章,权限设置
    app.put("/articles/:id",articleAuth,articles.update);
    //删除文章，权限设置
    app.delete("/articles/:id",articleAuth,articles.destroy);
    //首页
    app.get("/",articles.index);


    //评论加载
    app.param("commentId",comments.load);
    //GET添加评论
    app.get("/articles/:id/comments",auth.requiresLogin,comments.create);
     //POST添加评论
    app.post("/articles/:id/comments",auth.requiresLogin,comments.create);  // 
    //删除评论


    //tag routes
    app.get("/tags/:tag",tags.index)


    //错误处理
    app.use(function(err,req,res,next){
        if(err.message) return next();
        if (err.stack.includes('ValidationError')) {
            res.status(422).render('422', { error: err.stack });
            return;
        }
        res.status(500).render('500', { error: err.stack });
    })

    app.use(function(req,res,next){
        const payload = {
            url:req.originalUrl,
            error:"Not found"
        }
        if (req.accepts('json')) return res.status(404).json(payload);
        res.status(404).render('404', payload);
    })
    
}
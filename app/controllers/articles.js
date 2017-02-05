const mongoose = require("mongoose");
const { wrap:async } = require("co");  //使用co模块,接受一个generator函数，返回一个promise对象
const only = require("only");  //规定返回对象指定的现实的属性，相当于强制显示字段；

const { respond,respondOrRedirect } = require("../utils");
const Article = mongoose.model("Article");  //


//用于多对象的合并
const assign = Object.assign; // 方法可以把任意多个的源对象自身的可枚举属性拷贝给目标对象

//加载；async：最好使用try－catch来捕获异常
exports.load = async(function* (req,res,next,id){
    try{
       req.article = yield Article.load(id);  //根据ID查询文章；
       //console.log(req.article);
       if(!req.article) return next(new Error("文章不存在"));
    }catch(err){
        return next(err);
    }
    next();
})

//查询所有的文章，
exports.index = async(function* (req,res){
    //获取url链接上的page
    const page = (req.query.page > 0 ? req.query.page : 1) - 1;
    const _id = req.query.item;
    //console.log(_id);
    const limit = 30;  //限制限制数量
    const options = {  //限制查询条数
        limit:limit,
        page:page
    }
    // _id:存在
    if(_id) options.criteria = {_id};
    //查询所有的文章
    const articles = yield Article.list(options);  //list：查询所有文章，限制查询30 条
    const count = yield Article.count(); //count：查询所有文章的条目书
    respond(res,"articles/index",{
        title:"Articles",  //文章标题
        articles:articles, //所有的文章
        page:page + 1,  //当前显示的页数
        pages:Math.ceil(count / limit) //ceil：向上取整数；分多少页
    })
});

//GET添加新文章或者修改文章
exports.new = function(req,res,next){
    res.render("articles/new",{
        title:"添加文章",
        article:new Article()
    })
}

//POST创建的新的文章
exports.create = async(function* (req,res,next){
    const article = new Article(only(req.body,"title body tags"));//title body tags三个字段必须填写
    //console.log(article);
    article.user = req.user;
    try{
        yield article.uploadAndSave(req.file);//保存图片，规定图片格式
        respondOrRedirect({req,res},`/articles/${article._id}`,article,{
            type:"success",
            text:"创建新的文章成功"
        })
    }catch(err){
        //保存失败，重新渲染创建文件页面,422
        respond(res,"articles/new",{
            title:article.title || "创建文章",
            errors: [err.toString()],
            article
        },422)
    }
});


//根据ID获取文章详情
exports.show = function(req,res){
    //console.log(req.article);
    respond(res,"articles/show",{
        title:req.article.title,
        article:req.article
    })
    //
    //console.log(req.article.image);
}

//根据文章ID编辑文章内容
exports.edit = function(req,res){
    res.render("articles/edit",{
        title:"编辑" + req.article.title,
        article:req.article 
    })
}

//根据ID更新文章
exports.update = async(function *(req,res){
    const article = req.article;
    //console.log(only(req.body,"title body tags"));
    assign(req.article,only(req.body,"title body tags"));//assign:用于对象的合并;并对属性进行覆盖
    //console.log(req.file);
    try {
        yield article.uploadAndSave(req.file);
        respondOrRedirect({res},`/articles/${article._id}`,article);
    } catch (error) {
        respond(res,"article/edit",{
            title:"Edit" + article.title,
            errors:[err.toString()],
            article
        },422);
    }
});

//删除文章
exports.destroy = async(function* (req,res,next){
    //console.log("delete");
    yield req.article.remove();//这里相当于根据ID对象删除文章
    respondOrRedirect({req,res},"/articles",{},{
        type:"info",
        text:"删除成功"
    })
})
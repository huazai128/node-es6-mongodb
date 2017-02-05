const mongoose = require("mongoose");
const { wrap:async } = require("co");
const { respond } = require("../utils");
const Article = mongoose.model("Article");

//根据tag查询所有文章
exports.index = async(function*(req,res){
    const criteria = {tags:req.params.tag};
    const page = (req.params.page > 0 ? req.req.params.page : 1) - 1;
    const limit =  30;
    const options = {//查询条件配置参数;
        limit:limit,
        page:page,
        criteria:criteria
    }
    const articles = yield Article.list(options);//根据查询条件，查询文章
    const count = yield Article.count(criteria);//查询当前标签下文章的总数
    respond(res,'articles/index',{
        title: 'Articles tagged ' + req.params.tag,
        articles:articles,
        page:page+1,
        pages:Math.ceil(count / limit)
    })
})
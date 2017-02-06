const mongoose = require("mongoose");
const notify = require("../mailer");
const Schema = mongoose.Schema;

// const Imager = require("imager");  //用于图片上传
const config = require("../../config");
const imagerConfig = require(config.root + '/config/imager.js');

const getTags = tags => tags.join(","); //join：返回字符串,并且已逗号隔开
const setTags = tags => tags.split(",") //split：切割“,”返回一个数组

//定义的文章所需的字段
const ArticleSchema = new Schema({
    title:{type:String,default:"",trim:true},
    body:{type:String,default:"",trim:true},
    user:{type:Schema.ObjectId,ref:"User"},
    comments:[{
        body: { type : String, default : '' },
        user: { type : Schema.ObjectId, ref : 'User' },
        createdAt: { type : Date, default : Date.now }
    }],
    tags:{type:[],get:getTags,set:setTags},  //标签，数组类型
    image:{ //图片
        cdnUri:String,
        files:[]
    },
    createdAt:{type:Date,default:Date.now}  //文章字段
})

/**
 * 字段的验证
 */
ArticleSchema.path("title").required(true,"文章标题不能为空");
ArticleSchema.path("body").required(true,"文章内容不能为空");

//删除图片,用于监听remove事件
ArticleSchema.pre("remove",function(next){
    // const imager = new Imager(imagerConfig,"S3");
    // const files = this.image.files; //
    // imager.remove(files,function(err){
    //     if(err) return next(err);
    // },"article");
    next();
})


/**
 * 方法
 */
ArticleSchema.methods = {
    /**
     * 用于保存和更新image
     */
    uploadAndSave:function(image){
        //console.log(images);
        const err = this.validateSync(); //同步验证
        if(err && err.toString()) throw new Error(err.toString()); //如果错误返回
        return this.save();//否则保存
        // if (!images) return this.save();
        // const imager = new Imager(imagerConfig, 'S3');
        
        // imgaer.upload(images,function(err,cdnUri,files){
        //     console.log(cdnUri)
        // })
        
    },
    //添加评论
    addComment: function (user, comment) {
        //console.log(comment);
        console.log(typeof this.comments === "array");//constructor
        //这个不是数组，怎么办
        this.comments.push({
            body: comment.body,
            user: user._id
        });
        if (!this.user.email) this.user.email = 'email@product.com';
        notify.comment({
            article: this,
            currentUser: user,
            comment: comment.body
        });

        return this.save();
  },
    /**
     * 删除评论,根据评论ID删除
     */
    removeComment:function(commentId){
        const index = this.comments
        .map(comment => comment.id) //遍历comments对象；
        .indexOf(commentId)  //返回存在的下标
        //console.log(index);
        if(~index){
            this.comments.splice(index,1);
        }else{
            throw new Error("评论没有找到");
        }   
        return this.save();   //?? this.save()；哪里来的？
    }
}

/**
 * 静态方法
 */
ArticleSchema.statics = {
    //根据ID初始化文章，初始化显示文章和评论
    load:function(_id){
        return this.findOne({_id})  //根据ID查询
        .populate("user","name email username") //populate：查询User数据库，显示字段
        .populate("comments.user")  //
        .exec();
    },
    //查询所有的文章
    list:function(options){
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .populate("user","name username")  //查询user字段，显示name、username
            .sort({createAt:-1})   //时间排序
            .limit(limit)          //
            .skip(limit * page)
            .exec();
    }
}

mongoose.model("Article",ArticleSchema);
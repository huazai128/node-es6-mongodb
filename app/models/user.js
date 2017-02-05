/**
 * 定义用户字段
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crypto = require("crypto");  //密码加密

//使用第三方登录
const oAuthTypes = [
    "github",
    "qq",
    "facebook",
    "google",
    "weixin"
]

//User字段;
const UserSchema = new Schema({
    name:{type:String,default:""},
    username:{type:String,default:""},
    email:{type:String,default:""},
    provider:{type:String,default:""},
    hashed_password:{type:String,default:""},
    salt:{type:String,default:""},
    authToken:{type:String,default:""},
    facebook:{},
    qq:{},
    github:{},
    google:{},
    weixin:{}
})

//判断value是否存在，返回boolean
const validatePresenceOf = value => value && value.length;

//virtual:定义虚拟属性，该属性不会存储到数据库中；
UserSchema.virtual('password')
  .set(function (password) {//设置这个虚拟的字段
    this._password = password;
    this.salt = this.makeSalt();  //salt:密码加盐
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//验证在UserSchema定义的字段；其实可以添加required：来验证也可以
UserSchema.path("name").validate(function(name){  //验证name字段
    if(this.skipValidation()) return true;
    return name.length;
},"Name不能为空");//验证失败返回一个字符串

UserSchema.path("email").validate(function(email){ //验证email字段
    if(this.skipValidation()) return true;
    return email.length;
},"Email不能为空");

UserSchema.path("email").validate(function(email,fn){  //用于验证email是否存在
    const User = mongoose.model("User");
    if(this.skipValidation()) fn(true);
    if(this.isNaN || this.isModified("eamil")){
        User.find({email:email}).exec(function(err,users){
            fn(!err && users.length === 0);
        })
    }else{
        fn(true);
    }
},"Email已经存在");

UserSchema.path("username").validate(function(username){  //验证username是否为空
    if(this.skipValidatetion) return true;
    return username.length;
},"Username不能为空");

UserSchema.path("hashed_password").validate(function(hashed_password){//验证密码是否为空
    if(this.skipValidation()) return true;
    return hashed_password.length && this._password.length;
},"Password不能为空");

//pre(save) hook:保存前生命周期钩子;用于检测密码的是否有效；
UserSchema.pre("save",function(next){ //this:只想UserSchema对象
    if(!this.isNaN)return next(); //isNaN：用于检测数字是否为非法；为true表示表示非法数字，
    if(!validatePresenceOf(this.password) && !this.skipValidation()){
        next(new Error("无效的密码"))
    }else{
        next();
    }
})

/**
 * Method:是在UserSchema对象中定义方法,
 */
UserSchema.methods = {
    //检查密码是否一致
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    //密码加盐对象变化值
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';  //
    },
    //对密码进行加密
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto  //是用sha1算法加密
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },
    //判断使用第三方登录是否存在
    skipValidation: function () {
        return ~oAuthTypes.indexOf(this.provider); //返回第三方登录所在数组的下表
    }
};


/**
 * 静态方法
 */
UserSchema.statics = {  
    //定义load方法
    load:function(options,cd){ //
        //console.log(options);
        options.select = options.select || 'name username email';//强制显示字段
        //select：表示强制显示或隐藏；＋或 1：表示强制显示字段，－或0:强制隐藏字段；使用query查询
        return this.findOne(options.criteria).select(options.select).exec(cd)
    }
}

//导出
module.exports = mongoose.model("User",UserSchema); //只要UserSchema添加到model中；就可以调用

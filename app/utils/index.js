/**
 * 作用：根据业务是否使用模版引擎，来选择返回数据的形式；
 *  两个方法：第一个用于数据查询成功返回数据API,
 */
module.exports = {
    respond,
    respondOrRedirect
}
//处理成功相应数据，并渲染相关页面，或者是json形式数据返回；可以在模版引擎下使用，也可以在前后端分离时使用，已json数据返回
function respond(res,tpl,obj,status){
    res.format({   //响应格式处理
        html: () => res.render(tpl,obj),  //渲染页面，并发送数据
        json: () => {
            if(status) return res.status(status).json(obj);  //如果是json请求返回数据
        }
    })
}
//响应成功，并重定向到页面
function respondOrRedirect({req,res},url="/",obj={},flash){  //url：默认参数“/”,obj：默认数据控对象
    res.format({
        html:() => {
            if(req && flash) req.flash(flash.type,flash.text);
            res.redirect(url);
        },
        json: () => res.json(obj)
    })
}


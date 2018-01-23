let http = require('http'),
    url = require('url'),
    fs  = require('fs'),
    mime = require("mime");

let server = http.createServer(function(req,res){
    //解析url,得到pathname和query的值
    let {pathname,query} = url.parse(req.url,true);
    if(pathname=="/favicon.ico") return;

    //1.处理静态资源文件
    if(pathname=="/"){
        //读取index.html文件
       let indexCon =  fs.readFileSync(__dirname+"/index.html");
       //设置响应首部content-type,也就是设置下返回数据的mime类型
       res.setHeader("content-type","text/html; charset=utf-8");
       //把读取到的index.html文件的内容返回给浏览器
       res.end(indexCon);
        return;
    }
    //判断文件是否存在
    let flag = fs.existsSync(__dirname+pathname);
    if(flag){
        //异步读取文件
        fs.readFile(__dirname+pathname,function(err,file){
            if(err){
                res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});
                res.end("文件不存在");
                return;
            }
            res.setHeader("content-type",`${mime.getType(pathname)}; charset=utf-8`);
            //file指读取到的文件的内容,把这个内容返回给浏览器
            res.end(file);
        });
        return;
    }
    //2.处理接口
    let resObj = {  //resObj作为服务器返回给客户端的数据
        "code":0,//0成功 1失败
        "msg":"",
        "data":[]
    };
    let strs = fs.readFileSync(__dirname+"/json/data.json");//模拟是从数据库里读取所有的数据
    //把读取到的数据转换成对象格式
    let users = JSON.parse(strs);
    //设置服务器返回的数据格式,都是json类型的数据
    res.setHeader("content-type","application/json; charset=utf-8");


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~接口部分~~~~~~~~~~~~~~~~~
    //->获得所有的数据
    if(pathname =="/getList"){

    if(query.id){//通过id值获取到数据
         let user = users.find((item)=>{//返回id值是query.id的这一项
             return item.id == query.id;
         })
        resObj.data = user;
        res.end(JSON.stringify(resObj));
    }else{//获取到所有的数据
        resObj.data = users;
        res.end(JSON.stringify(resObj));
        return;
    }
    }

    //->添加客户信息

    if(pathname =="/addInfo"&&req.method =="POST"){
        let str = '';
        req.on("data",function(chunk){//当客户端向服务器发送数据时会触发data事件
          str+=chunk;
        });
        req.on("end",function(){//当客户端数据全部发送完后会触发end事件
            //console.log(str);//'{"name":"555","tel":"666"}'
            let strObj = JSON.parse(str);
            //给传进来的数据{"name":"555","tel":"666"}增加id属性,若data.json中没有数据则id值是1,有数据则id值是最后一项id值的基础上加1
            strObj.id = users.length>0?users[users.length-1].id*1+1:1;
            //把新增的这项放入数组users
            users.push(strObj);
            //把users重新写入data.json里,相当于把数据存入数据库
            fs.writeFileSync(__dirname+"/json/data.json",JSON.stringify(users));
            resObj.data = users;
            resObj.msg = "添加成功";
            res.end(JSON.stringify(resObj));
        })
    }

    //修改客户信息
    if(pathname=="/updateInfo"&&req.method =="POST"){
        let str = "";
        req.on("data",function(chunk){
            str+=chunk;
        })
        req.on("end",function(){
            let strObj = JSON.parse(str);//{"id":"3","name":"林维帅234","tel":"123456783432"}

            //修改data.json里的某一项
            users = users.map((item)=>{
                if(item.id ==strObj.id){//若是传进来的这项,则返回传进来的这项(strObj)
                    return strObj;
                }
                return item;//其他的还是返回原来项
            });
            resObj.data = users;
            fs.writeFileSync(__dirname+"/json/data.json",JSON.stringify(users));
            resObj.msg ="修改成功";
            res.end(JSON.stringify(resObj));
        })
    }

    //删除信息
    if(pathname=="/removeInfo"){
        //从users数组中返回id值不是query.id的所有项
        users = users.filter((item)=>{
            return item.id!=query.id;
        })
        resObj.data = users;
        fs.writeFileSync(__dirname+"/json/data.json",JSON.stringify(users));
        resObj.msg = "删除成功";
        res.end(JSON.stringify(resObj));
        return;
    }


});
server.listen(9099,()=>{
    console.log("9099端口被启用")
})


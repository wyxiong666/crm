~(function(){
    let extend = (_default,options)=>{
        let o = {};
        for(let key in _default){
            if(!_default.hasOwnProperty(key)) continue;
            o[key] =  key in options ? options[key] :_default[key];
        }
        return o;
    } ;
    //http://wwww.baidu.com:8080/pathname?name='zf'&age=8#hash
    let hasSearch = (url)=>url.indexOf("?")>-1?"&":"?";

    //{name:"zf",age:8}转换成"name='zf'&age=8"
    let encodeObjectUrl = (obj)=>{
        let str = '';
        for(let attr in obj){
            if(!obj.hasOwnProperty(attr)) continue;
            str+=`${attr}=${encodeURIComponent(obj[attr])}&`;//"name='zf'&age=8&"
        }
        str = str.slice(0,str.length-1);
        return str;
    };

    let ajax = (options)=>{
        let _defalut = {
            type:'get',
            url:null,
            async:true,
            cache:true,
            data:null,
            dataType:"text",
            success:null,
            error:null
        };
        _defalut = extend(_defalut,options);
        let {type,url,async,cache,data,dataType,success,error} = _defalut;
        let xhr = new XMLHttpRequest();
        let regGet = /^(get|delete|head)$/i;
        let regPost = /^(post|put)$/i;
        //  ||  只要有一个条件成立,整体就成立  && 两个条件都成立,整体才成立
        if(!regGet.test(type)&&!regPost.test(type)) return;
        if(data&&regGet.test(type)){
            if(Object.prototype.toString.call(data)=="[object Object]"){
                data = encodeObjectUrl(data);
            }
                url+=`${hasSearch(url)}${data}`;
                data = null;
        }
        //不走缓存,则在url地址后强制加个随机数
        if(regGet.test(type)&&cache==false){
            url+=`${hasSearch(url)}_=${Math.random()}`;
        }

        xhr.open(type,url,async);
        xhr.onreadystatechange = function(){
            if(xhr.readyState==4&&/^2\d{2}$/.test(xhr.status)){
                let result = xhr.responseText;
                switch (dataType){
                    case "json":
                        result = "JSON" in window ? JSON.parse(result):eval("("+result+")");
                        break;
                    case "xml":
                        result = xhr.responseXML;
                        break;
                }
                success&&success(result);
            }
            if(xhr.readyState==4 && /^(4|5)\d{2}$/.test(xhr.status)){
                error&&error(xhr);
            }
        }
        xhr.send(JSON.stringify(data));
    };
    window.ajax = ajax;
})();

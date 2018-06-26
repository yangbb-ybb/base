//  global和base 都是 基础库
//  基础配置文件
var config={
    appid: 'wx0508e34eecfbae7b',
    baseAddress:{
        commond:'https://common.zmwxxcx.com',
        yewu:'https://dotline.zmwxxcx.com',
    }
}
// js私有变量 极简实现
let Symbol  = window.Symbol;
let idCounter = 0;  //防止 小概率 出现相同的情况
if (!Symbol) {
    Symbol = function Symbol(key) {
        return `__${key}_${Math.floor(Math.random() * 1e9)}_${++idCounter}__`
    }
    Symbol.iterator = Symbol('Symbol.iterator')
}
//扩充promise的方法
Promise.prototype.finally = function (callback) {
    var Promise = this.constructor;
    return this.then(
        function (value) {
            Promise.resolve(callback()).then(
                function () {
                    return value;
                }
            );
        },
        function (reason) {
            Promise.resolve(callback()).then(
                function () {
                    throw reason;
                }
            );
        }
    );
}
window.Symbol = Symbol;
// 当前实例
let exp;
// 这里是 一些函数
class base {
    constructor(){
        // 储存当前对象
        this.queue=[];           // 不同于微信的 ajax 我个人准备  小游戏的 请求 走的 队列形式
        this.queueFlag=false;    // 表示 正在 走当前  的队列
        this.queueDoubleClick=[];// 为了防止出现 重复点击什么的
        this.wxlogin=typeof wx !=='undefined' ? (wx&&wx.login):{}; //微信的login
    }
    // 测试函数
    static test(){
        // let a=this.prototype.promise().then(()=>{
        //     console.log('成功的 回调');
        //     //throw new Error('hello');
        // }).catch(err=>{
        //     console.log(err)
        // }).finally(function(){
        //     console.log('最后执行')
        // });
        // // console.log(a)
    }
    ///////下面的 这些 都是 直接拿过来 直接用了 可能需要改
    // 在微信里面 是不会出错的
    // 从计算机内存中去我需要的东西
    getStoragePromisify(obj = {}) {
        try{
            return new Promise((resolve, reject) => {
                obj.success = (res) => {resolve(res)}
                obj.fail = (err) => {resolve({data: err})}
                wx.getStorage(obj)
            })
        }catch(err){
            console.log(err)
        }
    }
    Promisify(wxFn, options = {}) {
        return function middleware(obj = {}) {
            return new Promise((resolve, reject) => {
                obj.success = options.success ? options.success(resolve) : (res => { resolve(res) })
                obj.fail = options.fail ? options.fail(reject) : (err => { reject(err) })
                wxFn(obj)
            })
        }
    }
    // 微信登录
    requestPromisify(obj = {}) {
        return new Promise((resolve, reject) => {
            obj.success = res => { resolve(res.data) };
            obj.fail = err => { reject(err) }
            if (obj.method && obj.method.toUpperCase() === 'POST') {
                obj.header = obj.header || {};
                obj.header['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            wx.request(obj)
        })
    }

    loginPromisify (){
        let wxlogin=wx.login;
        let options={};
        let obj={};
        return new Promise((resolve, reject) => {
            obj.success = options.success ? options.success(resolve) : (res => { resolve(res) })
            obj.fail = options.fail ? options.fail(reject) : (err => { reject(err) })
            wxlogin(obj)
        })
    }

    //Promisify(this.wxlogin)  // 小程序登陆
    /**
     * 登录方法，先取出本地 Token 检查是否过期，过期的情况下才进行 login
     * 约定：  登陆后获取到用户信息 均存储在 storage 中： {'userClient': data}
     *        data 为 object： {Expire: 1, Token: '', UserID: ''}
     * 返回： 该方法返回 登录接口返回的信息 即含有 Token、UserID 等
     */
    login(){  //额 需要把login 也封装到  请求里面吗
        try{ //微信 小程序的 登陆系统
            //换取code
            return this.getStoragePromisify({ key: "userClient" })
                .then(res => {
                    //console.log(res,'取内存中的token');
                    if (res.data.Token &&res.data.Expire &&new Date().getTime() < res.data.Expire * 1000) {
                        throw {
                            code: 1,
                            msg: "Token 存在且未过期,无需 login",
                            data: res.data
                        };
                    }
                })
                .then(this.loginPromisify)
                .then(res => {
                    //console.log(res.code,'查看code')
                    if (res.code) {
                        return this.requestPromisify({
                            url: `${config.baseAddress.commond}/xcx/login`,
                            method: "POST",
                            data: {
                                code: res.code
                            },
                            header: {
                                cookie: `AppKey=${config.appid}`
                            }
                        });
                    } else {
                        console.log("用户 login 失败！");
                        throw res.errMsg;
                    }
                })
                .then(res => {
                    //console.log(res,'没有登录，调取登录的结果')
                    if (res.f === 1) {
                        // res.d: {Token: '', UserID: ''}
                        wx.setStorage({
                            key: "userClient",
                            data: res.d
                        });
                        return res.d;
                    } else {
                        console.log("登录失败");
                    }
                })
                .catch(err => {
                    if (err.code) {
                        return err.data;
                    } else {
                        console.log(err);
                    }
                });
        }catch(err){
            //不是微信 小游戏的时候的 登陆系统  都不知道是什么 登陆
            console.log(err)
        }
    }
    // 需要新功能 请求 按照 队列  的形式
    ajaxQueue(obj={}){
        return this.login().then(res=>{
            let Token = res.Token;  // 取得token
            //console.error('请求 接口',obj)
            return  this.ajaxQueueRequest(obj,Token)
        })
    }
    // 第一次 写 若出错 纯属 正常操作
    // 当你需要 防止 出现双击  请求发送两遍  这种场景的时候
    ajaxQueueRequest (obj={},token){//ajax 请求promise化
        //发起  请求
        //嵌套promise
        var _this=this;
        return new Promise((resolve,reject)=>{
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    var respone;
                    try{
                        respone = JSON.parse(xhr.responseText);
                    }catch(err){
                        respone = xhr.responseText;
                        wx.showToast({
                            title:'返回的数据格式出错',
                            icon:'none',
                            duration:3000
                        })
                    }
                    //callback(respone);
                    resolve(respone);
                    // 成功的 回调
                    //_this.delay()
                    _this.nextTick.call(_this);
                }else if(xhr.readyState === 4 && (xhr.status >= 400 && xhr.status < 600)){// 服务器 返回了错误信息
                    var respone = xhr.responseText;
                    reject(respone)
                    // 服务器 返回失败
                    _this.nextTick.call(_this);
                }else if(xhr.readyState === 4){// 当执行 到4 的时候
                    _this.nextTick.call(_this);//直接 调用
                }
            };
            let params;
            // 为了 一个 特定的 key  防止出现 两次 请求 所以从 GET 请求中分离了开来
            let str='';
            for(let key in obj.data){
                str+=key+'='+obj.data[key]+'&'
            }
            str=str.slice(0,-1);//去掉最后一个&
            if(obj.method==='GET'||!obj.method){  // 当是get 请求的时候 把参数 放在最后
                obj.url=obj.url+'?'+str;
            }else if(obj.method==='POST'){// 原生的js 不支持传送对象 序列化
                params=obj.data;//JSON.stringify(obj.data);
            }
            //console.log(obj.data,params,'1323456789-=098765432');
            xhr.open(obj.method||"GET", obj.url, true);
            xhr.setRequestHeader('cookie', `AppKey=${config.appid};Token=${token}`);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //设置文件传输类型
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            }
            // note: In Internet Explorer, the timeout property may be set only after calling the open()
            // method and before calling the send() method.
            xhr.timeout = 5000;// 5 seconds for timeout
            if(obj.method==='GET'){
                xhr.send.bind(null,params);
            }else{
                xhr.send.bind(null,params);
            }
            // 使用 闭包把  当前的 请求信息 加入到队列 里面
            // 需要检测  当前的请求收在队列里面了 使用了 url为标志位
            //console.log(_this.queueDoubleClick,213232)
            console.log(obj.url+str,_this.queueDoubleClick);
            console.log(!_this.checkQueueDoubleClick(obj.url+str,_this.queueDoubleClick),'基础检测');
            !_this.checkQueueDoubleClick(obj.url+str,_this.queueDoubleClick)&&_this.queueDoubleClick.push(obj.url+str)&&_this.queue.push([xhr,params])
            console.log(!_this.checkQueueDoubleClick(obj.url+str,_this.queueDoubleClick),'添加结果');
            setTimeout(() => {
                //若队列里面  有长度
                //console.log(_this.queue.length&&!_this.queueFlag,_this.queue.length)
                if(_this.queue.length&&!_this.queueFlag||_this.queue.length===1){
                    //console.log(123)
                    _this.queueFlag=true; //  队列标志位
                    _this.queueDoubleClick.shift();//队列出栈
                    let xhr=_this.queue.shift();//[0].send();
                    //console.log(xhr,23433)
                    xhr[0].send(xhr[1]);
                    //console.log();//  调用当前的 队列
                }
            }, 0);//17想下一帧  开始
        })

    }
    nextTick(){
        //console.log('进入下一个请求',)
        if(this.queue.length){  // 进行下一个队列
            this.queueDoubleClick.shift();
            let nextQueue=this.queue.shift();
            nextQueue[0].send(nextQueue[1]);
        }else{// 当队列中没有 需要请求的列表的时候
            this.queue=[];//直接 清空  内存
            this.queueFlag=false;
        }
    }
    // 纯的请求 不存在队列等等的情况
    ajax(obj={}){
        var _this=this;
        return this.promise((resolve,reject)=>{
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    var respone = xhr.responseText;
                    //callback(respone);
                    resolve(respone);
                }else if(xhr.readyState === 4 && (xhr.status >= 400 && xhr.status < 600)){// 服务器 返回了错误信息
                    var respone = xhr.responseText;
                    reject(respone)
                }
            };
            xhr.open(obj.method||"GET", obj.url, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            }
            // note: In Internet Explorer, the timeout property may be set only after calling the open()
            // method and before calling the send() method.
            xhr.timeout = 5000;// 5 seconds for timeout

            xhr.send();
        })
    }
    // 检测当前需要 请求 是否已经在我的队列里面
    // params 需要传入 队列的使用其情况
    checkQueueDoubleClick(str,queue){
        cc.log(str,queue)
        return queue.some((item)=>{
            return item === str;
        })
    }
    delay(t, v) {
        return new Promise(function(resolve) {
            setTimeout(resolve.bind(null, v), t);
        });
    }
    // 还是 希望 能用道 .then 操作
    promise(){
        return new Promise((resolve,reject)=>{
            try{
                resolve();
            }catch(err){
                reject();
            }
        })
    }
    //玩家登陆 系统 验证
    //web安全 检测 对玩家的输入 进行检测  防止出现XSS攻击 等等的情况
    //额  这个 情况 待加吧  正常的功能 都写不完  T-T
    checkPlayInput(str){
        // 待续
    }
}
let B; // 实例对象
// 开启单例模式
if(!exp){//B和标志位 是同事存在的
    exp=Symbol('exp');
    B=new base();
}
export default B;
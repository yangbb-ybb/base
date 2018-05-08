//功能函数
var window=window||this||self;
class Base{
    constructor(){
        //初始化 设置
        this.array=new Array(0);//用于保存 各种变量
        this.emptyObject=Obeject.create(null);
        //一些平时很少用到的函数
        this.Infidity=Number.POSITIVE_INFINITY;   //正无穷
        this._Infidity=Number.NEGATIVE_INFINITY;  //负无穷
        this.MaxNumber =Number.MAX_VALUE;         //最大值
    }
    //测试函数
    static test(){
        //this.prototype.curry([12]);
        //this.prototype.createArray(2)
        //this.prototype.typeof('2')
        // this.prototype.async(function(){
        //     console.log(123)
        // }).then(()=>{console.log(2234)})
        console.log(this.prototype.isNative([].concat))
    }
    //产生Undefind数组
    createArray(num=1){
        return Array.apply(null,{length:num});
    }
    //扁平化数组
    curry(arr1=[]){
        let array=[];
        [].forEach.call(arr1,item=>{
            if(typeof item === 'object'){
                array=array.concat(this.curry(item));//产生一个新数组
            }else{
                array.push(item)
            }
        })
        return array
    }
    warn(str){
        console.warn('警告:'+str);
        // 后期可以加上 代码的出处什么的
        // 代码出处可以使用webpack 的loader
    }
    //窜输入对象 判断当前类型
    //只判断  一些 基础类型
    typeof (arge){
        let type=typeof(arge);
        switch (type){
            case 'number':
            case 'string':
            case 'function':
            case 'undefined':
               return type;
               break;
            case 'object':
                return this.checkObject(arge);
                break;
            default:
                return this.warn("sorry,we can't read this type of param");
        }
    }
    checkObject(arge){
        if(Array.isArray(arge)) return "array"
        if( arge !== null && typeof obj === 'object') return "object"
        return "null"
    }
    //合并两个数组/对象--->只能
    merge(from,to){
        if(!to){
            return  from
        }
        if(this.typeof(from)!=this.typeof(to)){
            return this.warn("sorry,we don't suppose two type object");
        }
        if(this.typeof(from)==='array'){
            return to.concat(from);
        }else{//对象
            return Object.assign(to,from);
        }
    }
    //讲一个函数转化为一个异步函数
    //支持 .then调用  普通若需要就用它吧
    async(func){
        if(this.typeof(func)!=='function')
            return this.warn('sorry,you must give a param as a function')
        //异步函数容器
        async function wrap(){
            await func();
        }
        return wrap()
    }
    //promise调用函数  主要为ajax需求使用它
    promise(){

    }
    //检查origin字符串中有没有 特定的 target字符串  也可使用 lastIndexOf
    indexOf(origin,target){
        return  String(origin).indexOf(String(target))===-1?false:true;
    }
    //检查2 正则匹配
    test(target,origin){
        return new RegExp(target).test(origin);
    }
    //检测3 使用search 搜索
    search(origin,target){
        // 自己测试的时候只看见 返回数字或者是 -1
        return  String(origin).search(String(target))===-1?false:true;
    }
    // 重复 几次
    repeat (target, n) {
        //也可以用 字符串 里面的 repeat 函数
        return (new Array(n + 1)).join(target);
    }
    //判断是否是 系统函数
    isNative(func){
        return this.indexOf(func,'native code');
    }
    //去掉字符串  前面和 后面的 空白的 字符
    // 数组扩展
    trim(str){
        //return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        //优化
        return str.replace(/^\s+|\s+$/g, '');
    }
    // 主要是 查找  数组里面是否拥有  当前元素
    arrayContains(target, item){
        return target.indexOf(item) > -1;//能检测出 数组中是否拥有当前的需要 测试的 值
    }
    
    /**
     * 下面是es6  里面的字符串新增的 函数
     * 其实 没有太多的  作用
     * 需要 的 我们 去记住
     * */
    //repeat 由于上面 设置了 原生的 repeat 方法 这里就算了
    // repeat(str,times){
    //     return str.repeat(times)
    // }
    //for( let XX of XXX)可以使用  for of 循环遍历 字符串
    // es6 版本 查找 特定的字符串
    includes(target,origin){
        //直接 返回  true 或者 false  会区分 大小写
        return origin.includes(target);
    }
    // 查找 特定的 字符串 开始 源 目标 支持从第几个 开始查找
    beginWith(target,origin,start){
        return origin.startsWith(target,start) // true
    }
    // 查找 特定的 字符串 结尾
    endwith(target,origin,start){
        return origin.endsWith(target,start) // true
    }
    // 字符串开始补全
    padStart(origin,target,num){
        return origin.padStart(target,num);
    }
    // 字符串结局补全
    padEnd(origin,target,num){
        return origin.padEnd(target,num);
    }
    //防止 出现一些常见的 漏洞
    stringRow(str){
        //String.raw 方法不是 一个正常的函数
        return String.raw`${str}`
        //当然  他也可以是一个正常的 函数
        // String.raw({ raw: 'test' }, 0, 1, 2);
        // 't0e1s2t'
        // 等同于
        // String.raw({ raw: ['t','e','s','t'] }, 0, 1, 2);
    }
    /**
     * 下面是 一些  创建的 es6 数组的 创建的功能
     * */
    //求一个数组的最大值
    //传入的参数是一个数组
    mathMax(arr){
        //原理运用了扩展 运算
        // es5写法 Math.max.apply(null,arr)
        return Math.max(...arr);
    }
    mathMin(arr){
        return Math.min(...arr);
    }
    //将类数组对象  转化为 真正的数组
    araryFrom(arrayLike){
        //得到由值组成的 对应的数据 组成的 数组
        // es5 的相关写法
        // [].slice.call(obj)
        // 也可以 直接使用   Object.values()//同为 es6
        return Array.from(arrayLike);
    }
    //PS: 相同的还有  一些 push、数组复制、数组拼接 等等方法  等以后用到的
    //find 函数
    find(origin,target){
        return origin.find((th) => th===taregt);//返回特定的数字
    }
}


/**
 * 下面是别人写的  promise 配合 wx api的原理
 * 虽然的 简化版的  但还是 有点用处吧
 * */
// /**
//  * 将异步API Promise 化（回调函数 改为 链式调用）。具体优化效果看最下边
//  * @param {* 微信原生异步API} wxFn
//  */
// function Promisify(wxFn, options = {}) {
//     return function middleware(obj = {}) {
//         return new Promise((resolve, reject) => {
//             obj.success = options.success ? options.success(resolve) : (res => { resolve(res) })
//             obj.fail = options.fail ? options.fail(reject) : (err => { reject(err) })
//             wxFn(obj)
//         })
//     }
// }
//
// /**
//  * wx.request Promise 化 -- 需要特殊处理
//  * @param {* 自定义传参} obj
//  */
// function requestPromisify(obj = {}) {
//     return new Promise((resolve, reject) => {
//         obj.success = res => { resolve(res.data) }
//         obj.fail = err => { reject(err) }
//         if (obj.method && obj.method.toUpperCase() === 'POST') {
//             obj.header = obj.header || {}
//             obj.header['Content-Type'] = 'application/x-www-form-urlencoded'
//         }
//         wx.request(obj)
//     })
// }
//
// /**
//  * wx.getStorage Promise 化 -- 需要特殊处理
//  * @param {* 自定义回调函数} obj
//  */
// function getStoragePromisify(obj = {}) {
//     return new Promise((resolve, reject) => {
//         obj.success = (res) => {resolve(res)}
//         obj.fail = (err) => {resolve({data: err})}
//         wx.getStorage(obj)
//     })
// }
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
        console.warn(str);
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
}

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
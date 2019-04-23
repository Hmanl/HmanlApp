var Utils = function(){}

Utils.prototype = {
    /**
     * 显示
     */
    show: function(node){
        if(!this.isNode(node)){
            return;
        }
        return node.active || (node.active = true,true);
    },
    
    /**
     * 隐藏
     */
    hide: function(node){
        if(!this.isNode(node)){
            return;
        }
        return !node.active || (node.active = false,true);
    },

    /**
     * 是否是节点
     */
    isNode: function(node){
        return node && node instanceof cc.Node;
    },

    /**
     * 移除字节点
     */
    removeAllChild: function(node){
        if(!this.isNode(node) || node.childrenCount <= 0) return;
        for (var idx in node.children.slice()) {
            node.children[idx].destroy();
        } 
    },
   
    /**
     * 是否是数字
     * @param obj
     * @returns {*|boolean}
     */
    isNumber: function (obj) {
        return obj && !isNaN(obj);
    },

    /**
     * 是否是字符串
     * @param obj
     * @returns {*|boolean}
     */
    isString: function (obj) {
        return obj && typeof(obj) === "string";
    },

    /**
     * obj --> int
     * @param obj
     * @param def
     * @returns {*}
     */
    toInt: function(obj, def){
        try{
            if(this.isNumber(obj)) {
                return parseInt(obj);
            }
            return def ? def : 0;
        }
        catch(ex){
            return def ? def : 0;
        }
    },

    /**
     * obj --> float
     * @param obj
     * @param def
     * @returns {*}
     */
    toFloat: function(obj, def){
        try{
            if(this.isNumber(obj)) {
                return parseFloat(obj);
            }
            return def ? def : 0;
        }
        catch(ex){
            return def ? def : 0;
        }
    },

    /**
     * 四舍五入
     */
    round: function(num, place){
        return this.toFloat((num || 0).toFixed(place))
    },

    /**
     * 随机数
     * @param min
     * @param max
     * @returns {*}
     */
    random: function(min, max){
        if(max === undefined){
            max = min;
            min = 0;
        }
        return this.toInt(min + Math.random() * (max - min));
    },

    /**
     * 格式化金币
     * @param stone
     */
    // formatStone: function(stone){
    //     stone = this.toFloat(stone);
    //     if(Math.abs(stone) >= 100000000){
    //         if(stone < 0)
    //         return Math.ceil(stone / 1000000.0) / 100.0 + "亿";
    //         else
    //         return Math.floor(stone / 1000000.0) / 100.0 + "亿";
    //     }else if(Math.abs(stone) >= 10000){
    //         if(stone < 0)
    //         return Math.ceil(stone / 100.0) / 100.0 + "万";
    //         else
    //         return Math.floor(stone / 100.0) / 100.0 + "万";
    //     }
    //     else{
    //         // return stone;
    //         return stone.toFixed(0);
    //     }
    // },

    formatStone: function(stone, digit){
        stone = this.toFloat(stone);
        if(Math.abs(stone) >= 100000000){
            if(stone < 0){
                stone = Math.ceil(stone / 1000000.0) / 100.0;
            } else {
                stone = Math.floor(stone / 1000000.0) / 100.0;
            }  
            return this.isNumber(digit) && digit >= 0 ? stone.toFixed(digit) + "亿" : stone + "亿";          
        } else if (Math.abs(stone) >= 10000){
            if(stone < 0){
                stone = Math.ceil(stone / 100.0) / 100.0;
            } else {
                stone = Math.floor(stone / 100.0) / 100.0;
            }   
            return this.isNumber(digit) && digit >= 0 ? stone.toFixed(digit) + "万" : stone + "万";           
        } else {
            // return stone;
            return stone.toFixed(0);
        }
    },

    /**
     * 格式化数字
     */
    formatNumber: function(num, length){
        length = this.toInt(length);
        if(length <= 0 || (num + "").length >= length){
            return num;
        } 
        var num = this.toFloat(num);
        return (Math.pow(10, length) + num).toString().substring(1)
    },

    /**
     * 时间格式化
     */
    timeDiff: function(timeStamp){
        timeStamp = this.toFloat(timeStamp);
        var time = new Date(timeStamp),
            diff = new Date(new Date().getTime() - timeStamp);
        if(diff.getUTCFullYear() > 1970 || diff.getUTCMonth() > 0 || diff.getUTCDate() > 1) {
            return time.getUTCFullYear() + "-" + this.formatNumber(time.getUTCMonth() + 1, 2) + "-" + this.formatNumber(time.getUTCDate(), 2) + " " + this.formatNumber(time.getHours(), 2) + ":" + this.formatNumber(time.getMinutes(), 2);
        }   
        if(diff.getUTCHours() > 0) {
            return diff.getUTCHours() + "小时前";
        }
        if(diff.getUTCMinutes() > 0){
            return diff.getUTCMinutes() + "分钟前";
        }
        return "刚刚";
    },

    /**
     * 方法绑定上下文
     * @param func
     * @param obj
     * @returns {*}
     */
    bindObj: function(func, obj){
        if(!func ||typeof(func) !== "function") return new Function();
        return function(){
            obj ? func.apply(obj, arguments) : func();
        }.bind(obj);
    },

    /**
     * json --> obj
     * @param str
     * @returns {*}
     */
    toJsonObj: function(str){
        try{
            return str && JSON.parse(str) || null;
        }
        catch(ex){
            return null;
        }
    },

    /**
     * obj ---> json
     * @param obj
     * @returns {*}
     */
    toJsonStr: function(obj){
        try{
            return obj && JSON.stringify(obj) || "";
        }
        catch(ex){
            return "";
        }
    },

    /**
     * 格式时间
     */
    formatTime: function(timeStamp, formatStr){
        timeStamp = this.toFloat(timeStamp, 0);
        timeStamp = timeStamp < 0 ? 0 : timeStamp;
        var date = new Date(timeStamp),fStr = '';
        switch(formatStr){
            case 'hh:mm:ss':
                fStr = this.formatNumber(date.getUTCHours(), 2) + ":" + this.formatNumber(date.getUTCMinutes(), 2) + ":" + this.formatNumber(date.getUTCSeconds(), 2);
                break;
            case "hh:mm":
                fStr = this.formatNumber(date.getUTCHours(), 2) + ":" + this.formatNumber(date.getUTCMinutes(), 2)
                break;
            case "mm:ss":
                fStr = this.formatNumber(date.getUTCMinutes(), 2) + ":" + this.formatNumber(date.getUTCSeconds(), 2);  
                break;
            case "hh":
                fStr = this.formatNumber(date.getUTCHours(), 2);
                break;
            case "mm":
                fStr = this.formatNumber(date.getUTCMinutes(), 2);
                break;
            case "ss":
                fStr = this.formatNumber(date.getUTCSeconds(), 2);
                break;
        }
        return fStr
    },

    /**
     * 获取地址栏参数
     */
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    },

    /**
     * 解析过期时间
     */
    parseExpiresStr: function (str) {
        if (!str)
            return null;
        var type = str.substring(0, 1);
        var num = str.substring(1, str.length) * 1; 
        switch (type) {
            case "s": num = num * 1000; break;
            case "h": num = num * 60 * 60 * 1000; ; break;
            case "d": num = num * 24 * 60 * 60 * 1000; break;
            default: num = 0; break;
        }
        if (num > 0) {
            var expires = new Date();
            expires.setTime(expires.getTime() + num);
            return expires;
        }
        return null;
    },

    /**
     * 获得cookie
     */
    getCookie: function (key) {
        var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    },

    /**
     * 设置cookie
     */
    setCookie: function (key, value, expiresStr) {
        var expires = this.parseExpiresStr(expiresStr);
        document.cookie = key + "=" + escape (value) + (expires != null ? ";expires=" + expires.toGMTString() : "");
    },

    /**
     * 删除cookie
     */
    delCookie: function (key) { 
        var expires = new Date(); 
        expires.setTime(expires.getTime() - 1); 
        var value = this.getCookie(key); 
        if (value != null) 
            document.cookie = key + "=" + value + ";expires=" + expires.toGMTString(); 
    },

    /**
     * 格式化日期
     */
    formatDate: function (date, formatStr) {
        return function (formatStr) {
            var str = formatStr;
            var Week = ['日', '一', '二', '三', '四', '五', '六'];

            str = str.replace(/yyyy|YYYY/, this.getFullYear());
            str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
            var month = this.getMonth() + 1;
            str = str.replace(/MM/, month > 9 ? month.toString() : '0' + month);
            str = str.replace(/M/g, month);

            str = str.replace(/w|W/g, Week[this.getDay()]);

            str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
            str = str.replace(/d|D/g, this.getDate());

            str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
            str = str.replace(/h|H/g, this.getHours());
            str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
            str = str.replace(/m/g, this.getMinutes());

            str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
            str = str.replace(/s|S/g, this.getSeconds());
            return str;
        }.call(date, formatStr);
    },

    /**
     * 增加时间
     */
    addDate: function (date, type, num) {
        switch (type) {
            case "y":
                date.setFullYear(date.getFullYear() + num); break;
            case "q": 
                date.setMonth(date.getMonth() + num * 3); break;
            case "m":
                date.setMonth(date.getMonth() + num); break;
            case "w":
                date.setDate(date.getDate() + num * 7); break;
            case "d":
                date.setDate(date.getDate() + num); break;
            case "h":
                date.setHours(date.getHours() + num); break;
            case "m":
                date.setMinutes(date.getMinutes() + num); break;
            case "s":
                date.setSeconds(date.getSeconds() + num); break;
        }
        return date;
    },

    /**
     * 获得图片根据链接
     */
    getImageByUrl: function(url, onSuccess, onError){
        var domain = window.location.protocol + "//" + window.location.host + "/";
        // if(!url || url.indexOf(domain) < 0) {
        //     setTimeout(function(){
        //         var err = {
        //             errorMessage: 'XMLHttpRequest cannot load ' + url,
        //             status: 404
        //         }
        //         onError && onError(err);
        //     }, 0);
        //     return false;
        // }

        cc.loader.load(url, function (err, texture) {
            if(err){
                onError && onError(err);
            }else{
                onSuccess && onSuccess(texture);
            }
        }.bind(this));    
        return true;
    },

    /**
     * 设置图片根据链接
     */
    setSpriteImage: function(sprite, url){
        sprite && url && this.getImageByUrl(url, function(texture){
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            sprite.spriteFrame = spriteFrame;
        }.bind(this));   
    },

    /**
     * 获取页面地址
     */
    getPageUrl: function () {
        try {
            return window.location.href;
        } catch (error) {
            return '';
        }
    },

    /**
     * 获取页面地址
     */
    getPageRawUrl: function () {
        try {
            return 'http://' + location.host + location.pathname;
        } catch (error) {
            return '';
        }
    },

    /**
     * 添加参数
     */
    addUrlPara: function (url, name, value) {
        if (/\?/g.test(url)) {
            if (/name=[-\w]{4,25}/g.test(url)) {
                url = url.replace(/name=[-\w]{4,25}/g, name + "=" + encodeURIComponent(value));
            } else {
                url += "&" + name + "=" + encodeURIComponent(value);
            }
        } else {
            url += "?" + name + "=" + encodeURIComponent(value);
        }
        return url;
    },

    /**
     * 获得匹配参数
     */
    getSearchStr: function (url) {
        var result = '';
        var regex = /\?([^#]*)/;
        if (regex.test(url)) {
            result = regex.exec(url)[0];
        }
        return result;
    },

    /**
     * 获得hash
     */
    getHashStr: function (url) {
        var result = '';
        var regex = /#([\w\W]*)/;
        if (regex.test(url)) {
            result = regex.exec(url)[0];
        }
        return result;
    },

    /**
     * 获得参数
     */
    getSearchParamValue: function (url, paramName) {
        var result = '';
        var searchStr = this.getSearchStr(url);
        var regex = new RegExp('(' + paramName + ')=([^&]*)');
        if (regex.test(searchStr)) {
            result = decodeURIComponent(regex.exec(searchStr)[2]);
        }
        return result;
    },

    /**
     * 替换参数
     */
    replaceSearchParamValue: function (url, paramName, paramValue) {
        var result = url;
        var searchStr = this.getSearchStr(url);
        var regex = new RegExp('(' + paramName + ')=([^&]*)');
        if (regex.test(url)) {
            result = url.replace(regex, '$1=' + encodeURIComponent(paramValue));
        } else {
            var hashStr = this.getHashStr(url);
            if (hashStr == '') {
                if (searchStr == '') {
                    result = url + '?' + paramName + '=' + encodeURIComponent(paramValue);
                } else {
                    result = url + '&' + paramName + '=' + encodeURIComponent(paramValue);
                }
            } else {
                if (searchStr == '') {
                    result = url.replace(hashStr, '?' + paramName + '=' + encodeURIComponent(paramValue) + hashStr);
                } else {
                    result = url.replace(hashStr, '&' + paramName + '=' + encodeURIComponent(paramValue) + hashStr);
                }
            }
        }
        return result;
    },

    /**
     * 获得账号信息
     */
    getAccountInfo: function () {
        var url = this.getPageUrl();
        var account = this.getSearchParamValue(url, 'userencrypstring');
        var password =  this.getSearchParamValue(url, 'userencryptkey');
        var accountInfo = {
            account: account,
            password: password
        };
        return accountInfo;
    },

    /**
     * 获取lxt串号
     */
    getUserLxt: function () {
        var result = this.getQueryString('lxt');
        if (!result) {
            var cookie = this.getCookie('lexun.com');
            var regex = new RegExp('(lxt)=([^&]*)');
            if (regex.test(cookie)) {
                result = decodeURIComponent(regex.exec(cookie)[2]);
            }
        }
        return result;
    },
}

//导出模块
module.exports = new Utils();
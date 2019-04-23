var lxUtils = require("lx.utils");

var Utils = function(){
    /**
     * 加粗
     */
    this.bold = function(str){
        return "<b>" + str + "</b>"
    };

    /**
     * 获得当地时间
     */
    this.getLocalTime = function(timeStamp){
        if(timeStamp <=0 ) 
            return "00";
        var date = new Date();  
        date.setTime(timeStamp);  
        var y = date.getFullYear();      
        var m = date.getMonth() + 1;      
        m = m < 10 ? ('0' + m) : m;      
        var d = date.getDate();      
        d = d < 10 ? ('0' + d) : d;      
        var h = date.getHours();    
        h = h < 10 ? ('0' + h) : h;    
        var minute = date.getMinutes();    
        var second = date.getSeconds();    
        minute = minute < 10 ? ('0' + minute) : minute;      
        second = second < 10 ? ('0' + second) : second;     
        return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
    };

    this.random = function(nums, nums2){
        if(nums2 === undefined){
            nums2 = nums,nums = 0;
        }
        return Math.floor(nums + Math.random() * (nums2 - nums + 1));
    };

    this.randomFloat = function(nums, nums2){
        if(nums2 === undefined){
            nums2 = nums,nums = 0;
        }
        return parseFloat((nums + Math.random() * (nums2 - nums)).toFixed(2));
    };

    this.createNodePool = function(prefab, count){
        if(typeof(count) != "number" || count <= 0) return;
        
        var pool = new cc.NodePool(), node = null;
        for(var i = 0; i < count; i++){
            node = cc.instantiate(prefab);
            pool.put(node);
        }
        return pool;
    };

    this.putNodeToPool = function(parentNode, pool){
        parentNode.children.forEach(function(node){
            pool.put(node);
        }, this);
    };

    // 四舍五入保留两位小数
    this.keepTwoDecimalFull = function(num) {
        var result = parseFloat(num);
        if (isNaN(result)) {
            // alert('传递参数错误，请检查！');
            return false;
        }
        // result = Math.floor(num * 100) / 100; // round
        result = Math.ceil(num * 100) / 100; // round
        var s_x = result.toString();
        var pos_decimal = s_x.indexOf('.');
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += '.';
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += '0';
        }
        return s_x;
    };
}

Utils.prototype = lxUtils; 
module.exports = new Utils();
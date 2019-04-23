var butils = require("lx.utils");

var HttpUtils = function(){

};

HttpUtils.prototype = {
    /**
     * post请求
     */
    post: function(url, data, success, fail){
        this.ajax({
            url: url,
            method: "POST",
            data: data,
            success: success,
            fail: fail
        });
    },

    /**
     * get请求
     */
    get: function(url, data, success, fail){
        this.ajax({
            url: url,
            method: "GET",
            data: null,
            success: success,
            fail: fail
        });
    },

    /**
     * ajax请求
     */
    ajax: function(option){
        var url = option.url;
        var data = option.data;
        var method = option.method || 'GET';
        var success = option.success;
        var fail = option.fail;
        var complete = option.complete;
        if(method == 'GET' && typeof data === 'object'){
            for(var idx in data){
                if(!data.hasOwnProperty(idx)) continue;
                url = butils.addUrlPara(url, idx, data[idx]);
            }
            data = null;
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    try {
                        data = JSON.parse(xhr.responseText);
                        success && success(data);
                    } catch (e) {
                        fail && fail("parse data error");
                    }
                } else {
                    fail && fail("network request failure");
                }
                complete && complete();
            }
        }.bind(this);
        xhr.open(method, url, true);
        var hContent = '';
        if(typeof data === 'object'){
            for(var keys in data){
                if(data.hasOwnProperty(keys) == true){
                    hContent += keys + '=' + data[keys] + '&'
                }
            }
            hContent = hContent.substring(0,hContent.length - 1);
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(hContent);
        xhr.ontimeout = function () {
            fail && fail("network request timeout");
            complete && complete();
        };
    },
};

//导出模块
module.exports = new HttpUtils();
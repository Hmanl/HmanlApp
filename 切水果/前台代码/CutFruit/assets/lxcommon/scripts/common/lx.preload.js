var lxUtils = require("lx.utils");
cc.Class({
    extends: cc.Component,

    properties: {
        /**
         * 资源路径
         */
        filePaths: [cc.String],

        /**
         * 资源目录集合
         */
        dirPaths: [cc.String],
    },

    /**
     * 默认构造
     */
    ctor: function(){
        this.fileObjs = [];
        this.dirObjs = [];
    },

    /**
     * 初始化
     */
    onLoad: function () {
        this.startTime = new Date().getTime();
        this.filePaths = this.filePaths || [];
        for (var idx in this.filePaths) {
            var path = this.filePaths[idx];
            if(!path) continue;

            var obj = lxUtils.toJsonObj(path);
            if(!obj) continue;

            this.fileObjs.push(obj);
        }

        this.dirPaths = this.dirPaths || [];
        for (var idx in this.dirPaths) {
            var path = this.dirPaths[idx];
            if(!path) continue;

            var obj = lxUtils.toJsonObj(path);

            if(!obj) continue;
            this.dirObjs.push(obj);
        }

        //处理预加载
        var run = function(){
            if(this.fileObjs.length <= 0 && this.dirPaths.length <= 0){
                this.unschedule(run);
                return;
            }
            this.loadFile(1)
            this.loadDir(1);
        }.bind(this);
        this.schedule(run, 0);
    },

    /**
     * 加载文件
     */
    loadFile: function(nums){
        if(this.fileObjs.length <= 0) return;

        var timeDiff = new Date().getTime() - this.startTime;
        var nums = nums || 1;
        var Objs = this.fileObjs;
        for (var i = 0; i < Objs.length; i++) {
            if(Objs[i].time < timeDiff){
                try{
                    var path = Objs[i].path;
                    Objs.splice(i, 1);
                    path && cc.loader.loadRes(path);
                    i--;
                }catch(ex){
                    console.error("预加载资源异常", ex);
                }
                if(--nums <= 0) break;  
            }
        }
    },

    /**
     * 加载目录
     */
    loadDir: function(nums){
        if(this.dirPaths.length <= 0) return;

        var timeDiff = new Date().getTime() - this.startTime;
        var nums = nums || 1;
        var Objs = this.dirPaths;
        for (var i = 0; i < Objs.length; i++) {
            if(Objs[i].time < timeDiff){
                try{
                    var path = Objs[i].path;
                    Objs.splice(i, 1);
                    path && cc.loader.loadResDir(path);
                    i--;
                }catch(ex){
                    console.error("预加载资源异常", ex);
                }
                if(--nums <= 0) break;  
            }
        }
    }
});

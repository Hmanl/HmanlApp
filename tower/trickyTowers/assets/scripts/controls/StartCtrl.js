
cc.Class({
    extends: cc.Component,

    properties: {
        //-- 开始按钮
        startBtn : cc.Node,

        //-- 排行按钮
        rankBtn : cc.Node,

        //-- 返回按钮
        backBtn : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.lxInit();
    },

    //乐讯初始化
    lxInit:function(){
        lx.config.set({
            gameid: 100100,

        });
        
        var parm = {
            scope: "scope.userInfo",

            success:function(res){         
                //弹出乐讯登陆框
                    lx.login({
                    success:function(res){
                        
                    }.bind(this)

                });
            }.bind(this),

            fail:function(){
                lx.authorize(parm);
            },
        };
        lx.authorize(parm);   



    },

    /**
     * 开始游戏
     */ 
    onStartGame : function(){
        console.log("开始游戏");
        cc.director.loadScene("game");
    },

    /**
     * 打开排行榜
     */ 
    onShowRank : function(){
        console.log("打开排行榜")
        this.backBtn.active = true;
        cc.find("Canvas/Layout/sharedCanvas").active = true;
        lx.postMessage({
            message: {cmd:"rank"}
        });

    },

    /**
     * 关闭排行榜
     */ 
    onCloseRank: function(){
        console.log("关闭排行榜")
        this.backBtn.active = false;
        cc.find("Canvas/Layout/sharedCanvas").active = false;
        lx.postMessage({
            message: {cmd:"closeRank"}
        });

    },


});

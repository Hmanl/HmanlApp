
cc.Class({
    extends: cc.Component,

    properties: {
        //-- 结束分数
        endScore : cc.Label,

        //-- 再开按钮
        againBtn : cc.Node,

        //-- 返回按钮
        backBtn : cc.Node,

        //-- 分享按钮
        shareBtn : cc.Node,

        //-- 皮肤按钮
        skinBtn : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.endScore.string = this.gameView = cc.find('Canvas/Layout/gameView').getComponent("GameCtrl").score.string;

        cc.find("Canvas/Layout/sharedCanvas").active = true;
        lx.postMessage({
            message: {cmd:"postUserScore"},
            data : {score :parseInt(this.endScore.string)}
        });


        //-- 打开结算排行榜
        lx.postMessage({
            message: {cmd:"rankSmall"}
        });
        

    },

    

    start () {

    },

    /**
     * 重开游戏
     */ 
    onAgainGame : function(){
        console.log("重开游戏")
        cc.director.loadScene("game");
        this.node.active = false;
        //-- 关闭结算排行榜
        lx.postMessage({
            message: {cmd:"closeRankSmall"}
        });
    },

    /**
     * 返回主界面
     */ 
    onBackGame : function(){
        console.log("返回主界面")
        cc.director.loadScene("start");
        //-- 关闭结算排行榜
        lx.postMessage({
            message: {cmd:"closeRankSmall"}
        });
    },

    /**
     * 分享游戏
     */ 
    onShareGame : function(){
        console.log("分享游戏")
    },

    /**
     * 返回主界面
     */ 
    onShowSkin : function(){
        console.log("皮肤界面")
    },
});

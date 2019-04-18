
cc.Class({
    extends: cc.Component,

    properties: {
        
    },


    // onLoad () {},

    onEnable:function(){
        this.node.getChildByName("score").getComponent(cc.Label).string=window.score;
    },

    //重新开始游戏
    restartGame:function(){
        cc.director.loadScene("game");
    },

    //退出游戏
    exitGame:function(){
        cc.director.loadScene("start");
    },

    

    // update (dt) {},
});

var cfComp = require("cf.comp");
var butils = require("cf.butils");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cc.Component,

    properties: {
        orderNumLab : cc.Label,
        nFruitMultiples : cc.Node,
        getLab : cc.Label,
        fruitSp : [cc.SpriteFrame]
    },

    init : function(settleInfo){
        var winfos = settleInfo.winfos;
        var children = this.nFruitMultiples.children;
        var uinfo = settleInfo.uinfo;
        var getStone = uinfo.winstone - uinfo.betstone;

        this.orderNumLab.string = settleInfo.gambleid;        
        this.getLab.string = uinfo && getStone != 0 ? butils.formatStone(getStone) : "";
        for(var i = 0, length = winfos.length; i < length; i++){
            var child = children[i];
            var winfo = winfos[i];
            child.getChildByName("fruit").getComponent(cc.Sprite).spriteFrame = this.fruitSp[winfo.id]; 
            // child.getChildByName("multiple").getComponent(cc.Label).string = "x" + butils.keepTwoDecimalFull(winfo.odds); 
            child.getChildByName("multiple").getComponent(cc.Label).string = "x" + winfo.odds.toFixed(2); 
        }
    },
});

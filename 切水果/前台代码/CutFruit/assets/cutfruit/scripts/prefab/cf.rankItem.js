var cfComp = require("cf.comp");
var butils = require("cf.butils");

cc.Class({
    extends: cfComp,

    properties: {
        iconSprites : [cc.SpriteFrame],
        icon : cc.Sprite,
        numLab : cc.Label,
        nameLab : cc.Label,
        coinLab : cc.Label,
    },

    init : function(info, idx){
        // console.log("排行榜item",info);
        this.hide();
        var index = parseInt(idx);
        switch(index){
            case 0:
            case 1:
            case 2:
                this.icon.node.active = true;
                this.icon.spriteFrame = this.iconSprites[index];
                break;
            default : 
                this.numLab.node.active = true;
                this.numLab.string = index + 1;
                break;
        }
        this.nameLab.string = info.userinfo.nick;
        this.coinLab.string = butils.formatStone(info.winstone - info.betstone);
    },

    hide : function(){
        this.icon.node.active = false;
        this.numLab.node.active = false;
    },
});

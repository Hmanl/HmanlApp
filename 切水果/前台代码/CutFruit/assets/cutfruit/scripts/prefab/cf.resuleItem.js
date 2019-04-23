var cfComp = require("cf.comp");
var butils = require("cf.butils");

cc.Class({
    extends: cfComp,

    properties: {
        highPower : cc.Sprite,
        icon : cc.Sprite,
        num : cc.Label,
        iconSprites : [cc.SpriteFrame],
    },

    init : function(winfo, idx){
        idx == "0" && (this.highPower.node.active = true);
        this.icon.spriteFrame = this.iconSprites[winfo.id];
        // this.num.string = "x" + butils.keepTwoDecimalFull(winfo.odds); 
        this.num.node.color = winfo.odds.toFixed(2) >= 1 ? new cc.Color(255, 0, 0) : new cc.Color(143, 96, 42);
        this.num.string = "x" + winfo.odds.toFixed(2) + "倍"; 
    },
    
});

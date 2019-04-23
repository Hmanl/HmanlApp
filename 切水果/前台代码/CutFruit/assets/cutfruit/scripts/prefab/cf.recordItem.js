var cfComp = require("cf.comp");
var butils = require("cf.butils");

cc.Class({
    extends: cfComp,

    properties: {
        numLab : cc.Label,
        iconSprites : [cc.SpriteFrame],
    },

    init : function(wager, idx){
        this.node.getComponent(cc.Sprite).spriteFrame = this.iconSprites[idx];
        this.numLab.string = butils.formatStone(wager);
    },
});

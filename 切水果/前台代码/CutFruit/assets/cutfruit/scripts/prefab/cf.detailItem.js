var cfComp = require("cf.comp");
var butils = require("cf.butils");

cc.Class({
    extends: cfComp,

    properties: {
        iconSprites : [cc.SpriteFrame],
        icon : cc.Sprite,
        multiple : cc.Label,
        betNum : cc.Label,
        income : cc.Label,
    },

    init : function(wager, odds){
        // console.log(odds);
        var betstone = wager.betstone;
        var winstone = wager.winstone;
        this.icon.spriteFrame = this.iconSprites[wager.wagerid];
        // this.multiple.string = Math.floor(odds * 100) / 100; 
        // this.multiple.string = butils.keepTwoDecimalFull(odds); 
        
        this.multiple.string = odds.toFixed(2); 
        this.betNum.string = butils.formatStone(betstone, 2);
        this.income.string = butils.formatStone(winstone - betstone, 2);
        // console.log(wager, winstone - betstone, butils.formatStone(winstone - betstone), betstone * odds);
    },
});

var cfComp = require("cf.comp");
var sceneData = require("cf.sceneData");
var butils = require("cf.butils");

cc.Class({
    extends: cfComp,

    properties: {
        nDetailsContent : cc.Node,
        detailItem : cc.Prefab,
    },

    onEnable : function(){
        this.renderDetails();
    },

    onDisable : function(){
        this.clearContent();
    },

    clearContent : function(){
        this.nDetailsContent.removeAllChildren();
    },

    // 渲染投注细节
    renderDetails : function(){
        var settleInfo = sceneData.settleInfo,
            wager = settleInfo.uinfo.wager,
            winfos = settleInfo.winfos,
            info = null, odds = 0, detailItem = null;

        // console.log("wager", wager);  
        // console.log("winfos", winfos);  

        for(var i in wager){
            info = wager[i];
            for(var j in winfos){
                if(info.wagerid == winfos[j].id){
                    odds = winfos[j].odds; // 获取对应水果的赔率
                    break;
                }
            }
            detailItem = cc.instantiate(this.detailItem);
            detailItem.parent = this.nDetailsContent;
            detailItem.getComponent("cf.detailItem").init(info, odds);
        }
    },

});


var cfComp = require("cf.comp");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cfComp,

    properties: {
        nWangQiContent : cc.Node,
        wangQiItem : cc.Prefab,
    },

    onEnable : function(){
        this.renderView();
    },

    onDisable : function(){
        this.clearContent();
    },

    renderView : function(){
        var list = sceneData.roomInfo.settleinfos;
        // console.log("保存的往期记录",list);
        var length = list.length;
        if(length <= 0) return;
        this.clearContent();
        var settleInfo = null, newWangQiItem = null;
        for(var i = 0; i < length; i++){
            settleInfo = list[i];
            newWangQiItem = cc.instantiate(this.wangQiItem);
            newWangQiItem.parent = this.nWangQiContent;
            newWangQiItem.getComponent("cf.wangQiItem").init(settleInfo);
        }
    },

    clearContent : function(){
        this.nWangQiContent.removeAllChildren();
    },
});

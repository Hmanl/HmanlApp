
cc.Class({
    extends: cc.Component,

    properties: {
        rankItem : cc.Prefab,
        ranklist : cc.Node,
        rankMe : cc.Node,
    },

    onLoad () {

    },

    start () {

    },

    //-- 生成排行榜列表渲染
    renderRankList :function(dataList, myidx){
        if(!dataList) return;
   
        //-- 渲染好友排行
        var newList,len = dataList.length;
        if(len > 5){
            newList = dataList.slice(0, 5);
        } else {
            newList = dataList;
        }

        var newLen = newList.length;
        this.ranklist.removeAllChildren();
        for(var i = 0; i < newLen; i ++){
            var itemInfo = newList[i];
            var newRankItem = cc.instantiate(this.rankItem);
            newRankItem.parent = this.ranklist;
            newRankItem.getComponent("rankItem").init(itemInfo, i);
        }
        this.rankMe.removeAllChildren();
        //-- 渲染自己排行
        if(myidx >= 0){
            var myInfo = dataList[myidx];
            var myRankItem = cc.instantiate(this.rankItem);
            myRankItem.parent = this.rankMe;
            myRankItem.getComponent("rankItem").init(myInfo, myidx);
            myRankItem.getComponent(cc.Sprite).spriteFrame = "";

        }
    },


});

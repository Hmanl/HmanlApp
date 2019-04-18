
cc.Class({
    extends: cc.Component,

    properties: {
        rankItem : cc.Prefab,
        ranklist : cc.Node,
        pageView : cc.Node,
    },

    onLoad () {

    },

    start () {
        console.log(this.ranklist);
    },  

    //-- 生成排行榜列表渲染
    renderRankList :function(dataList, myidx){
        if(!dataList) return;
        //-- 渲染好友排行
        var len = dataList.length;
        this.ranklist.removeAllChildren();
        this.itemArr=[];
        for(var i = 0; i < len; i ++){
            var itemInfo = dataList[i];
            var rankItem = cc.instantiate(this.rankItem);
            rankItem.getComponent("rankItem").init(itemInfo, i);
            this.pageView.getComponent(cc.PageView).addPage(rankItem);
            if(myidx>0&&myidx==i){
                this.pageView.getComponent(cc.PageView).setCurrentPageIndex(myidx);
                rankItem.scale=1.2;
            }
            this.itemArr.push(rankItem);
        }       

    },

    // 监听事件
    onPageEvent (sender, eventType) {
        // 翻页事件
        if (eventType !== cc.PageView.EventType.PAGE_TURNING) {
            return;
        }
        this.allItemFun();
        this.itemArr[sender.getCurrentPageIndex()].scale=1.2;
    },

    allItemFun:function(){
        for(let i=0;i<this.itemArr.length;i++){
            this.itemArr[i].scale=1;
        }
    }

});

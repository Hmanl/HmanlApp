
cc.Class({
    extends: cc.Component,

    properties: {
        rankSlItem : cc.Prefab,

        //-- 结算排行榜
        rankSlList :cc.Node,

        //-- 结算排行榜
        bestScore :cc.Label,
    },

    onLoad(){
        
    },

    //-- 生成排行榜列表渲染
    renderRankList :function(dataList, myidx){
        if(!dataList) return;

        this.bestScore.string = dataList[myidx]["kvdata"]["value"]["game"]["score"];

        //-- 渲染结算排行
        var newList= {},len = dataList.length;
        // 先考虑dataList长度
        if(len >= 3){
            if(myidx == 0){
                newList.list = dataList.slice(0,3);
                newList.id = 1;
            } else if (myidx == len - 1){
                newList.list = dataList.slice(myidx - 1, myidx + 1);
                newList.id = len - 2;
            } else {
                newList.list = dataList.slice(myidx - 1, myidx + 2);
                newList.id = myidx;
            }
        } else if (len < 3) {
            newList.list = dataList.slice();
        }

        var newLen = newList.list.length,index = 0;
 
        this.rankSlList.removeAllChildren();
        for(var i = 0; i < newLen; i ++){
            var itemInfo = newList.list[i];  
            newLen == 3 ? index = newList.id + i - 1 : index = i;
            var newRankSlItem = cc.instantiate(this.rankSlItem);
            newRankSlItem.parent = this.rankSlList;
            newRankSlItem.getComponent("rankSlItem").init(itemInfo, index);

            //-- 自己的排行举高高
            if(i==1){
                newRankSlItem.y = 155
            }

            if(newLen == 1){
                newRankSlItem.y = 155
            }


        }

        

    },


});

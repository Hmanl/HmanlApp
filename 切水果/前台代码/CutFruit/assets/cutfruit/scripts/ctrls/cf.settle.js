var cfComp = require("cf.comp");
var butils = require("cf.butils");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cfComp,

    properties: {
        nResultContnet : cc.Node,
        resuleItem : cc.Prefab,
        nRankContent : cc.Node,
        rankItem : cc.Prefab,
        betLab : cc.Label,
        winLab : cc.Label,
        gainLab : cc.Label,
        nMyRank : cc.Node,
        nDetails : cc.Node,
        gainStoneGuide : cc.Node,
    },

    onLoad : function(){
        this.clearLastTimeResult();
    },

    onDisable : function(){
        this.clearLastTimeResult();
        this.clearMyInfo();
    },

    // 清空上轮结果
    clearLastTimeResult : function(){
        this.gainLab.string = "";
        this.nResultContnet.removeAllChildren();
        this.nRankContent.removeAllChildren();
        this.gainStoneGuide.active && (this.gainStoneGuide.active = false);
    },

    // 清空我的信息
    clearMyInfo : function(){
        cc.find("num", this.nMyRank).getComponent(cc.Label).string = "";
        cc.find("name", this.nMyRank).getComponent(cc.Label).string = "";
        cc.find("coin", this.nMyRank).getComponent(cc.Label).string = "";
    },

    onEnable : function(){
        this.randerSettleView();
    },

    // 渲染结算界面
    randerSettleView : function(){
        var settleInfo = sceneData.settleInfo;
        this.resule(settleInfo.winfos);
        this.gain(settleInfo.uinfo);
        this.rank(settleInfo.uinfos);
    },

    // 水果倍率
    resule : function(winfos){
        if(winfos.length < 1) return;

        var winfo = null, resuleItem = null;
        for(var i in winfos){
            winfo = winfos[i];
            resuleItem = cc.instantiate(this.resuleItem);
            resuleItem.parent = this.nResultContnet;
            resuleItem.getComponent("cf.resuleItem").init(winfo, i);
        }
    },

    // 本局奖励
    gain : function(uinfo){
        if(!uinfo) return;
        // console.log("本局奖励", uinfo);
        var gainStone = uinfo.winstone - uinfo.betstone;
        this.betLab.string = butils.formatStone(uinfo.betstone, 2);
        this.winLab.string = butils.formatStone(uinfo.winstone, 2);
        this.gainLab.string = butils.formatStone(gainStone, 2);

        // 显示赚币引导
        gainStone > 0 && this.showGainStoneGuide(uinfo); 
    },

    // 赚币引导
    showGainStoneGuide : function(uinfo){
        // 区分显示哪种提示 0~0.5(单期投入<10亿) 0.5~1(水果种类多余3个)
        var tipsText = "";
        if(Math.random() <= 0.5){
            if(uinfo.betstone > 1000000000) return;

            var singlePeriodInfo = lx.getStorageSync("singlePeriod");
            if(singlePeriodInfo.isShow) return;           
            if(butils.random(0, 100) > 80) return;

            tipsText = "温馨提示：投入乐币越多，中奖时获得乐币越多哦~";

            singlePeriodInfo.isShow = true;
            lx.setStorageSync("singlePeriod", singlePeriodInfo);
        } else {
            var betFruitTypeNum = 0, wager = uinfo.wager,
                fruitTypeInfo = lx.getStorageSync("fruitType");

            if(fruitTypeInfo.isShow) return;

            for(var i = 0, len = wager.length; i < len; i++){
                wager[i].betstone > 0 && betFruitTypeNum ++;
            }
            if(betFruitTypeNum < 3) return;
            if(butils.random(0, 100) > 80) return;

            tipsText = "温馨提示：切的水果越多种，赢率越大哦~";

            fruitTypeInfo.isShow = true;
            lx.setStorageSync("fruitType", fruitTypeInfo);
        }

        tipsText && (this.gainStoneGuide.getChildByName("text").getComponent(cc.RichText).string = butils.bold(tipsText), this.gainStoneGuide.active = true);
    },

    // 排行榜
    rank : function(uinfos){
        if(uinfos.length < 1) return;
        // console.log("排行榜信息",uinfos);
        var newUinfos = [];
        for(var i = 0, length = uinfos.length; i < length; i++){
            var item = uinfos[i];
            // 过滤掉盈亏<=0的情况
            if(item.winstone - item.betstone > 0){
                newUinfos.push(item);
            }
        }
        if(newUinfos.length <= 0) return;

        newUinfos.sort(function(uinfo1, uinfo2){
            return (uinfo2.winstone - uinfo2.betstone) - (uinfo1.winstone - uinfo1.betstone);
        });
        
        var uinfo = null, myInfo = null, myIdx, rankItem = null,
            myUserinfo = sceneData.userView.userinfo;
        for(var j in newUinfos){
            uinfo = newUinfos[j];
            if(uinfo.userinfo.userid == myUserinfo.userid){
                myInfo = uinfo;
                myIdx = j;
            }
            rankItem = cc.instantiate(this.rankItem);
            rankItem.parent = this.nRankContent;
            rankItem.getComponent("cf.rankItem").init(uinfo, j);
        } 
        this.setMyRankInfo(myInfo, myIdx);
    },

    setMyRankInfo : function(myInfo, idx){
        if(myInfo == null || myInfo && myInfo.winstone - myInfo.betstone <= 0) return;

        cc.find("num", this.nMyRank).getComponent(cc.Label).string = parseInt(idx) + 1;
        cc.find("name", this.nMyRank).getComponent(cc.Label).string = myInfo.userinfo.nick;
        cc.find("coin", this.nMyRank).getComponent(cc.Label).string = butils.formatStone(myInfo.winstone - myInfo.betstone);
    },

    // 显示
    toggleDetailState : function(){
        this.nDetails.active = !this.nDetails.active;
    },

    // 关闭结算界面
    closeSettleView : function(){
        this.node.active = false;
        this.nDetails.active = false;
    },
});

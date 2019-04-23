var cfComp = require("cf.comp");
var sceneData = require("cf.sceneData");
var butils = require("cf.butils");
var config = require("cf.config");
var throwGenerate = require("cf.throwGenerate");
var luckyFruit = require("cf.luckyFruit");

cc.Class({
    extends: cfComp,

    properties: {
        nKnife : cc.Node,
        nRecordView : cc.Node,
        nRecordContent : cc.Node,
        recordItem : cc.Prefab,
        throwGenerate : throwGenerate,
        timeLab : cc.RichText,
        nSettle : cc.Node,
        nDetails : cc.Node,
        userCoin : cc.Label,
        nWangQiJiLu : cc.Node,
        nFruits : cc.Node, // 水果容器
        allBet : cc.Label,
        endTips : cc.Node,
        hangUp : cc.Node, // 挂机按钮
        hangUpPanel : cc.Node, // 挂机面板
        batterEffect : cc.Prefab, // 连击效果
        batterEffectBox : cc.Node, 
        luckyFruit : luckyFruit,
    },

    onLoad : function(){
        cc.director.setDisplayStats(false);
        this.setGainStoneGuideStorage();

        lx.global.event.on("show_settle_info", this.gambleInfoStatus_4_2, this);
        this.node.on("cutFruitSuccess", this.cutFruitSuccess, this);

        this.eventer.on("cf.game.inited", this.gameInited, this);
        this.eventer.on("cf.game.scene.view,cf.game.room.info", this.setSceneView, this);
        this.eventer.on("cf.game.user.stone.info", this.setUserStone, this);
        this.eventer.on("cf.game.update.gamble.info", this.updateGameInfo, this);
        this.eventer.on("cf.game.update.user.bet", this.updateUserBet, this);
        this.eventer.on("cf.game.user.bet.result", this.userBetResult, this);
        this.eventer.on("cf.game.update.wangqijilu", this.updateWangQiJiLu, this);
        this.eventer.on("cf.game.update.gamble.user.bet", this.updateGambleUserBet, this);
    },

    start : function(){
        this.knifeMs = null;
        // 判断浏览器是否支持webgl 只有webgl下才支持拖尾效果
        if(cc.sys.capabilities.opengl){            
            this.knifeMs = this.nKnife.getComponent(cc.MotionStreak);
        }        
        this.lastPoint = null;
        this.isUpdateTime = false;
        this.timeText = "";

        this.cfSettle = this.nSettle.getComponent("cf.settle");
        this.cfDetails = this.nDetails.getComponent("cf.details");

        this.hangUpBg = this.hangUp.getChildByName("bg");

        // 创建对象池
        this.createBatterEffectPool();

        this.lastEndTime = 0; // 上次触摸结束的时间
        this.cutFruitCount = 0; // 已切的水果的个数
    },

    // 连击效果对象池
    createBatterEffectPool : function(){
        this.batterEffectPool = new cc.NodePool();
        var initCount = 5;

        for(var i = 0; i < initCount; i++){
            this.batterEffectPool.put(cc.instantiate(this.batterEffect));
        }
    },

    // 连击效果
    cutFruitSuccess : function(){
        // 挂机不显示连击效果
        // if(config.isHangUp) return;

        var nowTime = new Date().getTime();
        if(this.lastEndTime > 0 && nowTime - this.lastEndTime > 1000){
            this.cutFruitCount = 0;
        }
        this.lastEndTime = nowTime;
        this.cutFruitCount ++;
        // console.log("已切水果个数", this.cutFruitCount);

        var batterEffect = null;

        if(this.batterEffectPool.size() > 0){
            batterEffect = this.batterEffectPool.get();
        } else {
            batterEffect = cc.instantiate(this.batterEffect);
        }

        batterEffect.parent = this.batterEffectBox;

        this.playBatterEffect(batterEffect);
    },

    // 播放连击效果动画
    playBatterEffect : function(node){
        var skeleton = node.getChildByName("skeleton").getComponent(sp.Skeleton);
        var label = node.getChildByName("text");
        var action = cc.sequence(
                cc.fadeIn(0),            
                cc.spawn(
                    cc.scaleTo(0.15, 2.2),
                    cc.moveBy(0.15, cc.v2(0, 5))                                
                ),
                cc.spawn(
                    cc.scaleTo(0.1, 1),
                    cc.moveBy(0.1, cc.v2(0, 8))                                
                ),
                cc.delayTime(0.01),
                cc.spawn(
                    cc.moveBy(0.48, cc.v2(0, 80)),
                    cc.fadeOut(0.48)
                ),
                cc.spawn(
                    cc.moveTo(0, cc.v2(0, -10)),
                    cc.scaleTo(0, 0)
                ),
                cc.callFunc(function(){
                    label.stopAllActions();
                    this.batterEffectPool.put(node)
                }.bind(this))
        );

        label.getComponent(cc.Label).string = "+" + this.cutFruitCount;
        skeleton.setAnimation(0, "combo", false);
        label.runAction(action);
    },

    // 挂机操作
    hangUpOperation : function(){
        if(!this.hangUpBg.activeInHierarchy){
            this.hangUpBg.active = true;
            this.hangUpPanel.active = true;
        } else {
            this.userCancelHangUp();
            this.sethangUpFruitsNotChecked();
            this.hangUpBg.active = false;
            this.hangUpPanel.active = false;       
        }
    },

    // 清空所有选中的水果
    sethangUpFruitsNotChecked : function(){
        this.hangUpPanel.children.forEach(function(node){
            node.getChildByName("checkbox").getComponent(cc.Toggle).isChecked = false;
        });
    },

    // 玩家挂机
    userHangUp : function(){
        config.isHangUp = true;

        // 取消触摸事件监听
        // this.unbindTouchEvent(); 

        // 发送挂机事件到已生成的水果中
        this.node.emit("user_hangup");
    },

    // 玩家取消挂机
    userCancelHangUp : function(){
        config.isHangUp = false;
        config.hangUpFruits = [];

        // 绑定触摸事件监听
        // this.bindTouchEvent(); 

        // 发送取消挂机事件到已生成的水果中
        this.node.emit("user_cancel_hangup");
    },

    // 玩家选挂机水果
    chooseHangUpFruit : function(event, param){
        if(event.isChecked){
            // 添加水果
            config.hangUpFruits.push(param);
        } else {
            // 取消所选的水果
            var index = config.hangUpFruits.indexOf(param);
            index != -1 && config.hangUpFruits.splice(index, 1);
        }

        /**
         * 每次更改之后判断config.hangUpFruits是否为空
         * 不为空 则挂机 
         * 为空 则取消挂机
         */
        config.hangUpFruits.length > 0 ? (!config.isHangUp && this.userHangUp()) : (config.isHangUp && this.userCancelHangUp());
    },


    // 设置赚币引导提示(在结算界面底部显示的)
    setGainStoneGuideStorage : function(){
        // 单期投入超过10亿 
        this.setStorageSync("singlePeriod");
        // 切中水果种类多余3个
        this.setStorageSync("fruitType");
    },

    setStorageSync : function(key){
        if(!key || typeof(key) != "string") return;

        if(!lx.getStorageSync(key)){
            var info = {
                isShow : false,
                time : new Date().getTime()
            }
            lx.setStorageSync(key, info);
        } else {
            var info = lx.getStorageSync(key);
            if(!this.isSameDayLogin(info.time)){
                info.isShow = false;
                info.time = new Date().getTime();
                lx.setStorageSync(key, info);
            }
        }
    },

    // 判断是否同一天登录
    isSameDayLogin : function(lastLoginTime){
        var nowLoginTime = new Date();
        if(nowLoginTime.toDateString() === new Date(lastLoginTime).toDateString()){
            return true;
        } else if (nowLoginTime > new Date(lastLoginTime)){
            return false;
        }
    },

    gameInited : function(){
        if(sceneData.userView.playerinfo.isnewer){
            this.loadSceneByDefault("guide");
            return;
        }
    },

    touchStart : function(event){
        var localPoint = this.node.convertToNodeSpaceAR(event.getLocation());
        if(this.knifeMs){
            this.knifeMs.enabled = true;
            this.knifeMs.reset();
            this.nKnife.setPosition(localPoint);
        }
        this.emitPositionToFruit(localPoint);
    },

    touchMove : function(event){
        var localPoint = this.node.convertToNodeSpaceAR(event.getLocation());
        if(this.knifeMs){
            this.nKnife.setPosition(localPoint);
        }
        this.emitPositionToFruit(localPoint);
    },

    touchEnd : function(event){
        var localPoint = this.node.convertToNodeSpaceAR(event.getLocation());
        if(this.knifeMs){
            this.knifeMs.enabled = false;
            this.knifeMs.reset();
        }
        this.emitPositionToFruit(localPoint);
        this.lastPoint = null;
    },

    // 发送鼠标位置给水果
    emitPositionToFruit : function(localPoint){
        var emitPoint = null, deltaX, deltaY, dis = 0;
        if(!this.lastPoint){
            this.lastPoint = emitPoint = localPoint;
            this.node.emit("touch_move_position", {msg : emitPoint});
        } else {
            dis = cc.pDistance(this.lastPoint, localPoint);
            if(dis >= 10){ 
                deltaX = (localPoint.x - this.lastPoint.x) / 5;
                deltaY = (localPoint.y - this.lastPoint.y) / 5;
                for(let i = 1; i <= 5; i++){
                    if(i == 5){
                        emitPoint = localPoint;
                    } else {
                        emitPoint = cc.v2(this.lastPoint.x + deltaX * i, this.lastPoint.y + deltaY * i);
                    }   
                    this.node.emit("touch_move_position", {msg : emitPoint});                
                }
            }
            this.lastPoint = localPoint;
        }
    },

    // 修改倍数
    changeMultiple : function(event, multiple){
        config.multiple = butils.toInt(multiple);
    },

    // 设置场景
    setSceneView : function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var roomInfo = sceneData.roomInfo;
        switch(roomInfo.status){
            case 1: // 准备中
                this.unbindTouchEvent();
                break;
            case 2: // 运行中
                this.updateGameInfo();
                break;
            default: break;
        }
    },

    // 更新游戏信息
    updateGameInfo : function(){
        var gambleinfo = sceneData.roomInfo.gambleinfo;
        switch(gambleinfo.status){
            case 0: // 重置上次结束时间
                this.gambleInfoStatus_0();
                break;
            case 1: // 投注中
                this.gambleInfoStatus_1();           
                break;
            case 2: // 推算中
                this.gambleInfoStatus_2();
                break;
            case 4: // 结算中
                this.gambleInfoStatus_4();        
                break;
            default : break;
        }
    },

    // 重置上次结束时间
    gambleInfoStatus_0 : function(){
        this.lastEndTime = 0;
        this.cutFruitCount = 0;
        this.showRecordAndContnet();
    },

    // 投注中
    gambleInfoStatus_1 : function(){
        this.bindTouchEvent();
        this.setUserStone(); 
        this.endTips.active = false;
        this.timeText = "投注中";
        this.setTime(); 
        this.throwGenerate.startFruitLauncher();
    },

    // 推算中
    gambleInfoStatus_2 : function(){
        this.unbindTouchEvent();
        this.throwGenerate.cancelAllSchedule();   
        // this.endTips.active = true;             
        // this.timeText = "结算中";
        // this.setTime(); 
        this.timeEndHideFruits();

        // 显示转盘 并开始转
        this.luckyFruit.node.active = true;
    },

    // 结算中
    gambleInfoStatus_4 : function(){
        this.allBet.string = "当期玩家总投入0乐币";
        !this.luckyFruit.node.active && (this.luckyFruit.node.active = true);
        this.luckyFruit.init();
    },

    gambleInfoStatus_4_2 : function(){       
        // this.endTips.active = false;

        if(!this.nSettle.active){
            this.nSettle.active = true;
        } else {
            this.cfSettle.clearLastTimeResult();
            this.cfSettle.clearMyInfo();
            this.cfSettle.randerSettleView();
        }   

        if(!this.nDetails.active) return;

        this.cfDetails.clearContent();
        this.cfDetails.renderDetails();
    },

    // 倒计时结束时隐藏场景中的水果
    timeEndHideFruits : function(){
        this.nFruits.children.forEach(function(node) {
            node.opacity = 0;
        }, this);
    },

    // 隐藏相关界面
    hideViews : function(){
        this.nSettle.active = false;
        this.nDetails.active = false;
    },

    // 绑定触摸事件
    bindTouchEvent : function(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    },

    // 取消触摸事件
    unbindTouchEvent : function(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    },

    // 显示用户金币
    setUserStone : function(){
        var stone = sceneData.userView.stoneinfo.stone;
        this.userCoin.string = butils.formatStone(stone);
    },

    // 所有人的投资信息
    updateGambleUserBet : function(){
        var allBetCoin = 0,
            wagerList = sceneData.roomInfo.gambleinfo.wager;      
        for(var i = 0, len = wagerList.length; i < len; i++){
            allBetCoin += wagerList[i];
        }
        this.allBet.string = "当期玩家总投入" + butils.formatStone(allBetCoin) + "乐币";
    },

    // 用户投注结果
    userBetResult : function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(data.resultbean.result == 0){
            if(data.resultbean.outmsg == "游戏币不足"){
                this.dialog.showConfirm("cf.user.stone.not.enough", "抱歉，你的游戏中乐币不足，请先存乐币。", "去存币", function(){
                    lx.module.golds.show();
                    return true;
                }, "取消");
                return;
            }
            this.dialog.showToast("cf.game.user.bet.fail", data.resultbean.outmsg); 
        }       
    },

    // 显示充值界面
    showGolds : function(){
        lx.module.golds.show();
    },

    // 更新用户投注
    updateUserBet : function(){
        if(!this.nRecordView.active) return;
        this.renderRecord();
    },

    // 显示记录按钮和已切水果
    showRecordAndContnet : function(){
        this.nRecordView.active = true;
        this.renderRecord();
    },

    // 切换记录显示
    record : function(){
        if(this.nRecordView.active){
            this.nRecordContent.removeAllChildren();
            this.nRecordView.active = false;
        } else {
            this.showRecordAndContnet();
        }
    },

    // 渲染已切的水果
    renderRecord : function(){
        var wagerList = sceneData.userView.playerinfo.wager;
        if(wagerList.length < 1) return;
        // console.log("已切中水果列表",wagerList);
        this.nRecordContent.removeAllChildren();
        var wager = null,recordItem = null;
        for(var i in wagerList){
            wager = wagerList[i];
            if(wager == 0) continue; // 过滤掉投注值为0的情况
            recordItem = cc.instantiate(this.recordItem);
            recordItem.parent = this.nRecordContent;
            recordItem.getComponent("cf.recordItem").init(wager, i);
        }
    },

    // 往期记录
    checkWangQiJiLu : function(evt, param){
        if(this.nWangQiJiLu.active && param == "open") return;
        this.nWangQiJiLu.active = !this.nWangQiJiLu.active;
    },

    // 更新往期记录
    updateWangQiJiLu : function(){
        if(!this.nWangQiJiLu.active) return;
        this.nWangQiJiLu.getComponent("cf.wangQiJiLu").renderView();
    },

    // 设置时间
    setTime : function(){
        this.time = sceneData.roomInfo.gambleinfo.interval + new Date().getTime();
        this.isUpdateTime = true;
    },

    // 倒计时
    updateTime : function(){
        var gambleinfo = sceneData.roomInfo.gambleinfo;
        var time = Math.floor((this.time - new Date().getTime()) / 1000); 
        if(time >= 0){
            if(gambleinfo.status == 1){
                time = time > 5 ? this.timeText + time + "s" : this.timeText + "<color=red>" + time + "s" + "</color>";
            } else if (gambleinfo.status == 2){
                time = "<color=orange>" + this.timeText + time + "s" + "</color>";
            }
            this.timeLab.string = time;
        } else {
            this.isUpdateTime = false;
            this.timeLab.string = "";
        }
    },

    update : function(dt){
        if(this.isUpdateTime){
            this.updateTime();
        }

        // 玩家挂机
        // if(sceneData.roomInfo.gambleinfo.status == 1 && config.isHangUp){
        //     var children = this.nFruits.children,
        //         childrenList = children.slice(),
        //         len = childrenList.length;

        //     for(var i = 0; i < len; i++){
        //         childrenList[i].getComponent("cf.fruit").autoCutFruit();
        //     }
        // }
    },
});

var cfComp = require("cf.comp");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cfComp,

    properties: {
        caiDeng : cc.Node,
        caiDengSp : sp.Skeleton,
        zhuanPan : cc.Node,
        multiple : cc.Node,
        fruitSpriteList : [cc.SpriteFrame],
        light : sp.Skeleton,
        resultFruit : cc.Node,
    },

    onLoad : function(){
        // 旋转最大速度
        this.maxSpeed = 12;
        // 加速度
        this.acc = 0.5;
        // 当前状态
        this.wheelState = 0;
        this.curSpeed = 0; 
        //每个齿轮的角度        
        this.gearAngle = 360 / 8;   
        this.zhuanPan.rotation = 0;
        //最终结果指定的角度
        this.finalAngle = 0;  
        // 减速旋转两圈
        this.decAngle = 2 * 360;  
    },

    onEnable : function(){
        this.zhuanPanChildren = this.zhuanPan.children;
        this.nums = cc.find("box/nums", this.multiple);
        // 幸运水果的Id
        this.luckyFruitId = 0;
        // 所有水果的倍率 按id排的
        this.multipleList = null;
        // 109是否结算
        this.isSettle = false;
        // 播放彩灯
        this.playCaiDengQuickSp();
        // 是否播放slow彩灯
        this.isPlaySlow = false;
        // 改变状态
        this.wheelState = 1;
    },

    onDisable : function(){
        this.isSettle = false;
        this.multipleList = null;
        this.luckyFruitId = 0;
        this.zhuanPan.rotation = 0;
        this.clearLastMultipleInfo();
        this.resetResultFruitInfo();
        this.resetMultipleInfo();
        this.changeNodeOpacity(this.caiDeng);
        this.changeNodeOpacity(this.caiDengSp.node);
        // 设置相关状态
        this.initStateInfos();
    },

    // 设置状态
    initStateInfos : function(){ 
        this.wheelState = 0;
        this.curSpeed = 0;
        this.zhuanPan.rotation = 0;
    },
    
    // 所有水果隐藏上轮的倍率
    clearLastMultipleInfo : function(){
        this.zhuanPanChildren.forEach(function(node) {
            node.getChildByName("multiple").opacity = 0;
            node.getChildByName("guess").opacity = 0;
        }, this);
    },

    // 重置结果信息
    resetResultFruitInfo : function(){
        this.changeNodeOpacity(this.resultFruit);
        this.resultFruit.getComponent(cc.Sprite).spriteFrame = null;
        this.resultFruit.setPosition(cc.v2(0, 130));       

        this.light.node.opacity = 0;
    },

    // 设置结果信息
    setResultFruitInfo : function(){
        this.resultFruit.getComponent(cc.Sprite).spriteFrame = this.fruitSpriteList[this.luckyFruitId];
        var action = cc.sequence(
            cc.scaleTo(0.1, 1.35),
            cc.scaleTo(0.08, 1),
            cc.scaleTo(0.1, 1.35),
            cc.scaleTo(0.08, 1),
            cc.moveTo(0.2, cc.v2(0, 0)),
            cc.callFunc(function(){
                this.playLuckyFruitLight();
                this.setMultipleInfo();
            }.bind(this))
        ).easing(cc.easeIn(3.0));

        this.changeNodeOpacity(this.resultFruit);
        this.resultFruit.runAction(action);
    },

    // 播放幸运水果闪光
    playLuckyFruitLight : function(){
        this.light.node.opacity = 255;
        this.light.setAnimation(0, "xinyunshuiguodonghua", false);
    },

    // 重置数字滚动
    resetMultipleInfo : function(){
        this.multiple.opacity = 0;
        this.nums.setPosition(cc.v2(0, 0));
    },

    // 数字滚动
    setMultipleInfo : function(){
        var luckyNum = this.nums.getChildByName("luckyNum");
        var luckyNumAction = cc.sequence(
            // // cc.delayTime(0.01),
            // cc.fadeOut(0),
            // cc.fadeIn(0.01),
            cc.scaleTo(0.1, 1.35),
            cc.scaleTo(0.08, 1),
            cc.scaleTo(0.1, 1.35),
            cc.scaleTo(0.08, 1),
            cc.callFunc(function(){
                this.changeLuckyFruitWenHao();
                this.showAllFruitMultiple();
            }.bind(this))
        );
        var numsAction = cc.sequence(
            cc.moveBy(0.85, cc.v2(0, 300)),
            cc.callFunc(function(){
                luckyNum.runAction(luckyNumAction);
            })
        );

        luckyNum.getComponent(cc.RichText).string = "<b>x" + this.multipleList[this.luckyFruitId].odds + "</br>";
        this.changeNodeOpacity(this.multiple);        
        this.nums.runAction(numsAction);
    },

    // 切换节点透明度
    changeNodeOpacity : function(node){
        if(!node instanceof cc.Node) return;
        node.opacity = node.opacity == 0 ? 255 : 0;
    },

    // 播放彩灯动画
    playCaiDengQuickSp : function(){
        this.changeNodeOpacity(this.caiDeng);
        this.changeNodeOpacity(this.caiDengSp.node);
        this.caiDengSp.setAnimation(0, "quick", true);
    },

    playCaiDengSlowSp : function(){
        this.caiDengSp.setAnimation(0, "slow", false);
    },

    // 转盘停止转动停在幸运水果
    zhuanPanRotateEnd : function(){
        this.changeLuckyFruitWenHao();
        this.setResultFruitInfo();
    },

    // 幸运水果显示或隐藏问号
    changeLuckyFruitWenHao : function(){
        var luckyFruit = this.zhuanPanChildren[this.luckyFruitId].getChildByName("guess");
        this.changeNodeOpacity(luckyFruit);
    },

    // 显示所有水果的倍率
    showAllFruitMultiple : function(){
        var length = this.multipleList.length,
            action1 = cc.fadeIn(0),
            action2 = cc.scaleTo(0.1, 1.2),
            action3 = cc.scaleTo(0.08, 0.8),
            action4 = cc.scaleTo(0.1, 1),
            callFunc = function(){
                var len = this.zhuanPanChildren.length,
                    multiple = null;
                for(var i = 0; i < len; i++){
                    if(i == this.luckyFruitId) continue;
                    multiple = this.zhuanPanChildren[i].getChildByName("multiple");
                    multiple.opacity = 255;
                    multiple.runAction(cc.sequence(action2, action3, action4));
                }
                var timer = setTimeout(function(){
                    clearTimeout(timer);
                    this.node.active = false;
                    lx.global.event.emit("show_settle_info");
                }.bind(this), 500);
            }.bind(this),
            action = cc.sequence(action1, action2, action3, action4,cc.callFunc(callFunc));

        for(var i = 0; i < length; i++){
            this.zhuanPanChildren[i].getChildByName("multiple").getComponent(cc.Label).string = this.multipleList[i].odds + "倍";
        }

        this.zhuanPanChildren[this.luckyFruitId].getChildByName("multiple").runAction(action);    
    },

    update : function(dt){
        if(this.wheelState === 0) return;

        if(this.wheelState === 1){
            this.zhuanPan.rotation += this.curSpeed;

            if(this.curSpeed <= this.maxSpeed){
                this.curSpeed += this.acc;
            } else {
                if(!this.isSettle) return;  // 没推结算信息
                //设置目标角度
                this.finalAngle = 360 - this.luckyFruitId * this.gearAngle;
                this.maxSpeed = this.curSpeed;
                this.zhuanPan.rotation = this.finalAngle;
                this.wheelState = 2;
            }
        } else if (this.wheelState === 2){
            if(!this.isPlaySlow){
                this.isPlaySlow = true;
                this.playCaiDengSlowSp();
            }
            var curRo = this.zhuanPan.rotation; //应该等于finalAngle
            var hadRo = curRo - this.finalAngle;
            this.curSpeed = this.maxSpeed * ((this.decAngle - hadRo) / this.decAngle) + 5; 
            this.zhuanPan.rotation = curRo + this.curSpeed;
            if((this.decAngle-hadRo) <= 0){
                this.wheelState = 0;
                this.zhuanPan.rotation = this.finalAngle;
                this.zhuanPanRotateEnd();
            }
        }
    },

    // 初始化转盘
    init : function(){
        this.computeLuckyFruit();
        this.isSettle = true;       
    },

    // 计算幸运水果
    computeLuckyFruit : function(){
        this.multipleList = sceneData.settleInfo.winfos.slice();
        var luckyFruit = this.multipleList[0];
        this.luckyFruitId = luckyFruit.id;

        this.multipleList.sort(function(a, b){
            return a.id - b.id;
        }.bind(this));

        // console.log("排序后", this.multipleList, this.luckyFruitId);
    },
    

});

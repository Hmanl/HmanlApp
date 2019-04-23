var cfComp = require("cf.comp");
var butils = require("cf.butils");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cfComp,

    properties: {
        fruit : cc.Node,
        stepFruit : cc.Node,
        grayLayer : cc.Node,
        stepContent : cc.Node,
        gainNum : cc.Label,
        gainLightNum : cc.Label,
        multiple : cc.Label,
        myRankName : cc.Label,
        myRankNum : cc.Label,
        rankItemName : cc.Label,
        rankItemNum : cc.Label,
    },

    onLoad : function(){
        // 屏幕高度
        this.winHeight = cc.game.canvas.clientHeight;
        this.finishedNum = 0;
        this.step = 1;
        this.step1();

        this.eventer.on("cf.newer.reward.result", this.NewerRewardResult, this);
    },

    hideView : function(){
        this.stepContent.children.forEach(function(node) {
            node.active = false;
        }, this);
    },

    showView : function(){
        this.getCurrentStepView().active = true;
    },

    getCurrentStepView : function(){
        return this.stepContent.getChildByName("step" + this.step);
    },

    initView : function(){
        this.hideView();
        this.showView();
    },

    step1 : function(){
        this.grayLayer.active = true;
        this.initView();        
        var stepView = this.getCurrentStepView();
        cc.find("step1_1/role/nextStep", stepView).on(cc.Node.EventType.TOUCH_END, this.step1_2, this);
    },

    step1_2 : function(){
        var stepView = this.getCurrentStepView();
        var step12 = cc.find("step1_2", stepView);

        cc.find("step1_1", stepView).active = false;
        step12.active = true;
        cc.find("role/nextStep",step12).on(cc.Node.EventType.TOUCH_END, this.step2, this);
    },
    
    step2 : function(){
        this.step ++;
        this.initView();
        var stepView = this.getCurrentStepView();
        var defaultBtn = stepView.getChildByName("defaultBtn");
        defaultBtn.on(cc.Node.EventType.TOUCH_END, this.step3, this);
    },

    step3 : function(){
        this.step ++;
        this.hideView();
        this.grayLayer.active = false;
        this.throwFruit();
    },

    throwFruit : function(){
        var stepFruitParent = this.stepFruit.parent;
        var bindTouchMove = function(){
            stepFruitParent.on(cc.Node.EventType.TOUCH_MOVE, function(){
                this.hideView();
                this.grayLayer.active = false;
                this.cutFruit();
            }, this);
        }.bind(this);
        var action1 = cc.moveTo(1, cc.v2(0, 145));
        var action2 = cc.rotateBy(1, 540); 
        var callFun = cc.callFunc(function(){
            this.grayLayer.active = true;
            this.stepFruit.rotation = this.fruit.rotation - 90;
            bindTouchMove();
            this.showView();
        }.bind(this));
        var action = cc.sequence(cc.spawn(action1, action2), callFun).easing(cc.easeInOut(3.0));
        this.fruit.runAction(action);
    },

    cutFruit : function(){
        this.fruit.rotation = 0;
        var splice = this.splice = this.fruit.getChildByName("splice");
        this.one = splice.getChildByName("1");
        this.two = splice.getChildByName("2");
        var knifeLight = splice.getChildByName("knifeLight");
        var juiceSp = splice.getChildByName("juice").getComponent(sp.Skeleton);
        var bubbleSp = splice.getChildByName("bubble").getComponent(sp.Skeleton);        
        
        this.fruit.getChildByName("icon").active = false;
        splice.active = true;
        bubbleSp.setAnimation(0, "bubble_orange", false);
        juiceSp.setAnimation(0, "juice_orange02", false); 
        knifeLight.color = new cc.Color(255, 155, 59); 
        knifeLight.runAction(cc.sequence(cc.rotateBy(0, this.fruit.rotation - 20), cc.delayTime(0.1), cc.fadeIn(0), cc.fadeOut(1.3)));
        this.playAnim();
    },

    // 执行下落动画
    playAnim : function(){
        // 先移动 再执行曲线运动
        var startPoint = this.splice.getPosition(),
            rightPoint1 = cc.v2(0, startPoint.y + 100), 
            leftPoint1 = cc.v2(0, startPoint.y + 100),

            rightPoint2 = cc.v2(0, -(this.winHeight / 2 + 200)), 
            leftPoint2 = cc.v2(0, -(this.winHeight / 2 + 200)), 

            moveRigntPoint = cc.v2(startPoint.x + 30, startPoint.y + 20),
            moveLeftPoint = cc.v2(startPoint.x - 30, startPoint.y + 20);

        rightPoint1.x = startPoint.x + 60; 
        leftPoint1.x = 2 * startPoint.x - rightPoint1.x;

        rightPoint2.x = startPoint.x + 120; 
        leftPoint2.x = 2 * startPoint.x - rightPoint2.x;

        var bezierTime = 1.2,
            rightBezierTo = cc.bezierTo(bezierTime, [rightPoint1, rightPoint2, rightPoint2]),
            leftBezierTo = cc.bezierTo(bezierTime, [leftPoint1, leftPoint2, leftPoint2]),
            finish = cc.callFunc(function(){
                this.finishedNum ++;
                if(this.finishedNum == 2){
                    this.step4();
                } 
            }, this);

        if(this.fruit.rotation - 20 >= 0){
            this.one.runAction(cc.sequence(cc.moveTo(0, moveLeftPoint), cc.spawn(leftBezierTo, cc.rotateBy(1.3, -150)), finish));
            this.two.runAction(cc.sequence(cc.moveTo(0, moveRigntPoint), cc.spawn(rightBezierTo, cc.rotateBy(1.2, 150)), finish));
        } else {
            this.one.runAction(cc.sequence(cc.moveTo(0, moveRigntPoint), cc.spawn(rightBezierTo, cc.rotateBy(1.3, 150)), finish));
            this.two.runAction(cc.sequence(cc.moveTo(0, moveLeftPoint), cc.spawn(leftBezierTo, cc.rotateBy(1.2, -150)), finish));
        }
    },

    step4 : function(){
        this.step ++;
        this.grayLayer.active = true;
        this.showView();
        var stepView = this.getCurrentStepView();
        cc.find("role/nextStep", stepView).on(cc.Node.EventType.TOUCH_END, function(){
            this.connector.send("cf.newer.reward");
        }, this);
    },

    step5 : function(data){
        this.step ++;
        var data = data || {stone : 100000};
        var stepView = this.getCurrentStepView();
        var gainLight = stepView.getChildByName("gainLight");
        var over = stepView.getChildByName("over");
        var close = over.getChildByName("close");
        var dialogLab = cc.find("role/dialog/text", stepView).getComponent(cc.Label);   
        var callBack = function(){
            gainLight.active = false;
            over.active = true;
            dialogLab.string = "恭喜您完成新手引导,\n快去切水果争霸吧~";
            close && close.on(cc.Node.EventType.TOUCH_END, function(){
                cc.director.loadScene("home");
            }, this);
        }.bind(this);

        var gainStone = data.stone.toNumber ? data.stone.toNumber() : data.stone; 
        var formatStone = butils.formatStone(gainStone); 
        this.gainNum.string = formatStone; 
        this.gainLightNum.string = formatStone;
        this.myRankNum.string = formatStone;
        this.rankItemNum.string = formatStone;
        dialogLab.string = "太厉害了,\n恭喜您赚了" + formatStone + "乐币!";
        // this.multiple.string = "X" + butils.keepTwoDecimalFull((gainStone + 100000) / 100000); 
        this.multiple.string = "X" + ((gainStone + 100000) / 100000).toFixed(2);
        this.initView();
        var userNick = sceneData.userView.userinfo.nick;
        this.myRankName.string = userNick;
        this.rankItemName.string = userNick;
        cc.find("role/nextStep", stepView).on(cc.Node.EventType.TOUCH_END, function(){
            cc.find("role/nextStep", stepView).active = false;
            cc.find("role/clickAnim", stepView).active = false;
            callBack();
        }, this);
    },

    NewerRewardResult : function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        // console.log("新手引导奖励",data);
        if(data.resultbean.result == 1){
            this.step5(data);
        } else {
            // this.connector.send("cf.newer.reward");
        }
    },
});

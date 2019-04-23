var cfComp = require("cf.comp");
var butils = require("cf.butils");
var config = require("cf.config");
var sceneData = require("cf.sceneData");

cc.Class({
    extends: cfComp,

    onLoad : function(){
        // 屏幕高度
        this.winHeight = cc.game.canvas.clientHeight;
        this.winWidth = cc.game.canvas.clientWidth;
    },

    reuse : function(){
        this.main = cc.find("Canvas/layout/main");
        this.main.on("touch_move_position", this.handleMovePosition, this);

        this.main.on("user_hangup", this.userHangUp, this);
        this.main.on("user_cancel_hangup", this.userCancelHangUp, this);
        
        this.timer = null;
        this.node.opacity = 255;
    },

    unuse : function(){
        this.main = cc.find("Canvas/layout/main");        
        this.main.off("touch_move_position", this.handleMovePosition, this);

        this.main.off("user_hangup", this.userHangUp, this);
        this.main.off("user_cancel_hangup", this.userCancelHangUp, this);

        this.unbindTimer();
    },

    ctor : function(){ 
        this.finishedNum = 0;
        this.radius = 50;
        this.startP = null;
        this.endP = null;
        this.cutSuccess = false;
        this.oldInfo = {
            one : {
                pos : cc.v2(0, 0),
                rotation : 0
            },
            two : {
                pos : cc.v2(0, 0),
                rotation : 0
            },
            iconRotation : 0,
        };

        this.timer = null;
    },

    // 监听玩家挂机
    userHangUp : function(){
        this.bindTimer();
    },

    // 监听玩家取消挂机
    userCancelHangUp : function(){
        this.unbindTimer();
    },

    // 绑定倒计时
    bindTimer : function(){
        if(config.hangUpFruits.indexOf(this.node.name) == -1 || this.timer) return;

        this.timer = setTimeout(function(){
            this.unbindTimer();
            this.autoCutFruit();
        }.bind(this), 600);
    },

    // 取消倒计时
    unbindTimer : function(){
        this.timer && clearTimeout(this.timer);
    },

    // 设置自动切水果
    autoCutFruit : function(){
        // 判断水果是否在视图范围中
        var position = this.node.getPosition();

        if(this.cutSuccess  
            || position.y < -80 || position.y > 200
            || position.x > Math.abs(this.winWidth / 2) 
            || sceneData.roomInfo.gambleinfo.status != 1)
        {
            console.log("自动切，但是不再范围之内");
            this.unbindTimer();
            return;
        }

        this.startP = position;

        var param = butils.random(0, 1) >= 0.5 ? 1 : -1;
        var endPoint = cc.v2(butils.random(position.x - 80, position.x + 80), 0);

        if(param > 0){
            endPoint.y = butils.random(position.y + 80 * param, position.y + 100 * param);
        } else {
            endPoint.y = butils.random(position.y + 100 * param, position.y + 80 * param);
        }
        this.endP = endPoint;
        // console.log("开始结束点", this.startP, this.endP, position);
        // console.log("水果的透明度：", this.node.opacity);
        this.computeLineHitCircle(position);
    },

    init : function(idx, nodePool, maxLength){
        // 此节点对应的对象池和对象池最大长度
        this.nodePool = nodePool;
        this.maxLength = maxLength;
        this.bubbleName = "";
        this.juiceName = "";
        this.lightColor = "";

        // green orange red white yellow
        var knifeLightColor = [{r:56, g:254, b:47}, {r:255, g:155, b:59}, {r:254, g:47, b:47}, {r:202, g:202, b:202}, {r:255, g:247, b:60}];
        switch(idx){
            case 0:
                this.bubbleName = "bubble_red";
                this.juiceName = "juice_red0";
                this.lightColor = knifeLightColor[2];
                break;
            case 1:
                this.bubbleName = "bubble_orange";
                this.juiceName = "juice_orange0";
                this.lightColor = knifeLightColor[1];
                break;
            case 2:
                this.bubbleName = "bubble_yellow";
                this.juiceName = "juice_yellow0";
                this.lightColor = knifeLightColor[4];
                break;
            case 3:
                this.bubbleName = "bubble_red";
                this.juiceName = "juice_red0";
                this.lightColor = knifeLightColor[2];
                break;
            case 4:
                this.bubbleName = "bubble_white";
                this.juiceName = "juice_white0";
                this.lightColor = knifeLightColor[3];
                break;
            case 5:
                this.bubbleName = "bubble_red";
                this.juiceName = "juice_red0";
                this.lightColor = knifeLightColor[2];
                break;
            case 6:
                this.bubbleName = "bubble_white";
                this.juiceName = "juice_white0";
                this.lightColor = knifeLightColor[3];
                break;
            case 7:
                this.bubbleName = "bubble_red";
                this.juiceName = "juice_red0";
                this.lightColor = knifeLightColor[2];
                break;
        }
        // 保存初始信息
        this.saveOldInfo();

        // 判断玩家是否挂机并设置计时器
        config.isHangUp && this.bindTimer();
    },

    handleMovePosition : function(event){
        if(this.cutSuccess) return;

        var localPosition = event.detail.msg;
        var nodePoint = this.node.getPosition();
        var pDistance = cc.pDistance(localPosition, nodePoint);

        if(pDistance > this.radius){

            this.endP = localPosition;
            this.computeLineHitCircle(nodePoint);

        } else {

            if(this.startP){
                this.endP = localPosition;
            } else {
                this.startP = localPosition;
            }

        }
    },

    // 判断线段是否传过水果
    computeLineHitCircle : function(nodePoint){
        if(this.startP && this.endP){
            var lineHitCircleResult = this.lineHitCircle(this.startP.x, this.startP.y, this.endP.x, this.endP.y, this.radius, nodePoint.x, nodePoint.y);
            // console.log("穿过水果是否成功", lineHitCircleResult);
            if(lineHitCircleResult != null && !this.cutSuccess){
                this.cutSuccess = true;
                this.cutFruitSuccess(this.startP, this.endP);
                this.sendMessage();

                // 发送切中信息到cf.main中显示总的切中水果个数
                this.node.dispatchEvent(new cc.Event.EventCustom('cutFruitSuccess', true));                
            }
        }

        this.startP = null;
        this.endP = null;
    },

    // 切中水果
    cutFruitSuccess : function(startP, endP){
        this.node.stopAllActions();
        this.node.rotation = 0;
        var velocity = cc.pSub(endP, startP);
        var angle = Math.atan2(velocity.y, velocity.x) * 180 / Math.PI;
        this.angle = -angle;

        this.knifeLight.rotation = -angle;
        this.knifeLight.color = new cc.Color(this.lightColor.r, this.lightColor.g, this.lightColor.b); 
        this.knifeLight.runAction(cc.sequence(cc.delayTime(0.1), cc.fadeIn(0), cc.fadeOut(1.3)));

        this.one.rotation = -angle;
        this.two.rotation = -angle;
        this.nIcon.rotation = -angle;
        this.nIcon.active = false;
        this.nSplice.active = true;
        this.bubbleAndJuice();
        this.playAnim(-angle);
    },

    // 发送消息
    sendMessage : function(){
        // console.log("切中水果的名字和id：", this.node.name,  config.fruitsId[this.node.name]);
        var roomInfo = sceneData.roomInfo;
        if(roomInfo.status == 1) return;
        if(roomInfo.status == 2 && roomInfo.gambleinfo.status != 1) return;

        var multiple = config.multiple, 
            wagerid = config.fruitsId[this.node.name],
            userStone = sceneData.userView.stoneinfo.stone;

        this.connector.send("cf.user.bet", {
            wagerid : wagerid,
            stone : multiple
        });
    },

    // 保存信息
    saveOldInfo : function(){
        this.nIcon = this.node.getChildByName("icon");
        var nSplice = this.nSplice = this.node.getChildByName("splice");
        this.one = nSplice.getChildByName("1");
        this.two = nSplice.getChildByName("2");
        this.juice = nSplice.getChildByName("juice");
        this.bubble = nSplice.getChildByName("bubble");
        this.knifeLight = nSplice.getChildByName("knifeLight");

        this.oldInfo.one.pos = this.one.getPosition();
        this.oldInfo.one.rotation = this.one.rotation;
        this.oldInfo.two.pos = this.two.getPosition();
        this.oldInfo.two.rotation = this.two.rotation;
        this.oldInfo.iconRotation = this.nIcon.rotation;
    },

    // 恢复原来的信息
    recoverOldInfo : function(){
        this.cutSuccess = false;
        this.finishedNum = 0;
        this.one.setPosition(this.oldInfo.one.pos);
        this.one.rotation = this.oldInfo.one.rotation;
        this.two.setPosition(this.oldInfo.two.pos);
        this.two.rotation = this.oldInfo.two.rotation;
        this.knifeLight.rotation = 0;
        this.nIcon.rotation = this.oldInfo.iconRotation;
        this.nIcon.active = true;
        this.nSplice.active = false;
        this.node.cleanup();
    },

    // 爆开果汁
    bubbleAndJuice : function(){ 
        var bubbleSp = this.bubble.getComponent(sp.Skeleton),
            juiceSp = this.juice.getComponent(sp.Skeleton),
            juiceNameIdx = butils.random(1, 2);
        bubbleSp.setAnimation(0, this.bubbleName, false);
        juiceSp.setAnimation(0, this.juiceName + juiceNameIdx, false);
    },

    // 执行下落动画
    playAnim : function(angle){
        // 先移动 再执行曲线运动
        var startPoint = this.nSplice.getPosition(),
            rightPoint1 = cc.v2(0, startPoint.y + 100), 
            leftPoint1 = cc.v2(0, startPoint.y + 100),

            rightPoint2 = cc.v2(0, -(this.winHeight / 2 + 200)), 
            leftPoint2 = cc.v2(0, -(this.winHeight / 2 + 200)), 

            moveRigntPoint = cc.v2(startPoint.x + 30, startPoint.y + 20),
            moveLeftPoint = cc.v2(startPoint.x - 30, startPoint.y + 20);

        rightPoint1.x = butils.random(startPoint.x + 30, startPoint.x + 80); // 50  100
        leftPoint1.x = 2 * startPoint.x - rightPoint1.x;

        rightPoint2.x = butils.random(startPoint.x + 80, startPoint.x + 130); // 100  150
        leftPoint2.x = 2 * startPoint.x - rightPoint2.x;

        var bezierTime = butils.randomFloat(0.8, 1.2),
            rightBezierTo = cc.bezierTo(bezierTime, [rightPoint1, rightPoint2, rightPoint2]),
            leftBezierTo = cc.bezierTo(bezierTime, [leftPoint1, leftPoint2, leftPoint2]),
            finish = cc.callFunc(function(){
                this.finishedNum ++;
                if(this.finishedNum == 2){
                    this.putBackToPool();
                } 
            }, this);

        if(angle >= 0){
            this.one.runAction(cc.sequence(cc.moveTo(0, moveLeftPoint), cc.spawn(leftBezierTo, cc.rotateBy(1.3, -150)), finish));
            this.two.runAction(cc.sequence(cc.moveTo(0, moveRigntPoint), cc.spawn(rightBezierTo, cc.rotateBy(1.2, 150)), finish));
        } else {
            this.one.runAction(cc.sequence(cc.moveTo(0, moveRigntPoint), cc.spawn(rightBezierTo, cc.rotateBy(1.3, 150)), finish));
            this.two.runAction(cc.sequence(cc.moveTo(0, moveLeftPoint), cc.spawn(leftBezierTo, cc.rotateBy(1.2, -150)), finish));
        }
    },

    // 放回对象池 
    putBackToPool : function(){  
        if(this.nodePool.size() < this.maxLength){
            this.recoverOldInfo();
            this.nodePool.put(this.node);
        } else {
            this.node.destroy();
        }
    },

    // 线段与圆碰撞检测
    lineHitCircle : function(x1, y1, x2, y2, r,xc ,yc){
        var dx_2_1 = x2 - x1, 
            dy_2_1 = y2 - y1,
            xd = 0, yd = 0, d = 0,
            t = ((yc - y1) * dy_2_1 + (xc - x1) * dx_2_1) / (dy_2_1 * dy_2_1 + dx_2_1 * dx_2_1);

        if(t >= 0 && t <= 1){
            xd = x1 + t * dx_2_1;
            yd = y1 + t * dy_2_1;
            d = Math.sqrt((xd - xc) * (xd - xc) + (yd - yc) * (yd - yc));
        } else {
            d = Math.sqrt((xc - x1) * (xc - x1) + (yc - y1) * (yc - y1));
            if(d > 4){
                d = Math.sqrt((xc - x2) * (xc - x2) + (yc - y2) * (yc - y2));
            }
        }
        if(d > r) return null;
        var lineDis = Math.sqrt((y2-y1) * (y2-y1)+(x2-x1) * (x2-x1));
        if(lineDis >= 10){
            var obj = {};
            obj.angle = Math.atan2(y2-y1, x2-x1);
            return obj;
        } else {
            return null;
        }
    },

    
});

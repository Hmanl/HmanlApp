var cfComp = require("cf.comp");
var butils = require("cf.butils");
var sceneData = require("cf.sceneData");
var config = require("cf.config");

cc.Class({
    extends: cfComp,

    properties: {
        fruits : [cc.Prefab],
        nFruits : cc.Node,
        time : cc.RichText,
    },

    onLoad : function(){
        this.createNodePools();
        // this.winWidth = cc.game.canvas.clientWidth;
        // this.winHeight = cc.game.canvas.clientHeight;

        this.winWidth = cc.find("Canvas").width;
        this.winHeight = cc.find("Canvas").height;
    },

    // 创建对应水果的对象池
    createNodePools : function(){
        this.fruitPoolArr = [];
        this.maxLength = 5;

        var len = this.fruits.length,
            newPool = null, newFruit = null;
        for(var i = 0; i < len; i++){
            newPool = new cc.NodePool("cf.fruit");
            for(var j = 0; j < this.maxLength; j++){
                newFruit = cc.instantiate(this.fruits[i]);
                newPool.put(newFruit);
            }
            this.fruitPoolArr.push(newPool);
        }
    },

    // 取消所有计时器
    cancelAllSchedule : function(){
        this.unscheduleAllCallbacks();
    },

    // 开始发射水果
    startFruitLauncher : function(){
        this.scheduleOnce(function(){
            this.fruitLauncher();
        }.bind(this), 1);
    },

    // 抛水果
    fruitLauncher : function(){
        // var interval = 1; 
        var interval = 0.5; 
        var self = this;
        var callBack = function(){
            self.createFruit();
            self.scheduleOnce(function(){
                callBack();
            }, interval);
        };
        callBack();
    },

    // 生成水果
    createFruit : function(){
        var fruitIdx, newFruit = null, pool = null,
            wagerids = sceneData.roomInfo.gambleinfo.wagerids,
            wageridsLen = wagerids.length;

        // 去水果池子取一种水果
        fruitIdx = wagerids[butils.random(0, wageridsLen - 1)];
        // 如果玩家挂机 增加选中水果出现的概率
        config.isHangUp && config.hangUpFruits.indexOf(fruitIdx) == -1 && (fruitIdx = wagerids[butils.random(0, wageridsLen - 1)]);
        pool = this.fruitPoolArr[fruitIdx];
        if(pool.size() > 0){
            newFruit = pool.get();
        } else {
            newFruit = cc.instantiate(this.fruits[fruitIdx]);
        }
        newFruit.parent = this.nFruits;
        newFruit.getComponent("cf.fruit").init(fruitIdx, pool, this.maxLength);
        this.throwFruit(newFruit, fruitIdx);
    },

    // 抛水果 
    throwFruit : function(nFruit, poolIdx){
        // 水果初始位置(xAxis, yAxis)  2个控制点(point1 point2)  抛出类型(throwType)
        var halfWinWidth = this.winWidth / 2;
        var widthRange = halfWinWidth + 100;
        var xAxis = butils.random(-widthRange, widthRange);
        var yAxis = -(this.winHeight / 2 + 150);
        var point1 = cc.v2(0, 0); 
        var point2 = cc.v2(0, 0);
        // -1:左抛  0:向上  1:右抛
        var throwType = butils.random(-1, 1);  
        nFruit.setPosition(xAxis, yAxis);

        var diffX = 0, diffLeftX = 0, diffRightX = 0;
        if(xAxis <= -halfWinWidth + 50){
            diffX = Math.abs(xAxis) - halfWinWidth;
            point1.x = butils.random(-halfWinWidth + 300, -diffX);
            point2.x = point1.x * 2 - xAxis;
        } else if (xAxis > -halfWinWidth + 50 && xAxis < halfWinWidth - 50){
            diffLeftX = halfWinWidth + xAxis;
            diffRightX = halfWinWidth - xAxis;
            switch(throwType){
                case -1:
                    point1.x = butils.random(xAxis, xAxis - diffLeftX / 2);
                    point2.x = point1.x * 2 - xAxis;
                    break;
                case 0:
                    point1.x = point2.x = xAxis;
                    break;
                case 1:
                    point1.x = butils.random(xAxis, xAxis + diffRightX / 2);
                    point2.x = point1.x * 2 - xAxis;
                    break;
            }
        } else if (xAxis >= halfWinWidth - 50){
            diffX = xAxis - halfWinWidth;
            point1.x = butils.random(diffX, halfWinWidth - 300);
            point2.x = point1.x * 2 - xAxis;
        }
        point1.y = butils.random((this.winHeight * 1.5), (this.winHeight) * 2.5); 
        point2.y = yAxis; 
        // console.log(xAxis, yAxis, point1, point2)

        var bezierTime = butils.randomFloat(3, 5), 
        // var bezierTime = 3, 
            bezierTo = cc.bezierTo(bezierTime, [point1, point2, point2]),
            finish = cc.callFunc(function(){
                this.putBackToPool(nFruit, poolIdx);
            }, this),
            action = cc.sequence(cc.spawn(bezierTo, cc.rotateBy(bezierTime, 600)), finish); 
        nFruit.runAction(action);
    },



    // 水果放回对象池
    putBackToPool : function(fruit, idx){
        var pool = this.fruitPoolArr[idx];
        if(pool.size() < this.maxLength){
            if(fruit.opacity != 255){
                fruit.opacity = 255;
            }
            pool.put(fruit);
        } else {
            fruit.destroy();
            fruit.removeFromParent(false);
        }
    },
    
});

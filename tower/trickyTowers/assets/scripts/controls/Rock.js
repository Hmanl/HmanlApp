
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //-- 初始下落速度
        this.speedY = -150,

        //-- 初始s水平速度
        this.speedX = 0,

        this.spawnFlag = true;

        this.deathFlag = true;

        // 屏幕边界值设置
        this.minPosX = - this.node.parent.parent.width/2  + parseInt(this.node.width/2);
        this.maxPosX = this.node.parent.parent.width/2 - parseInt(this.node.width/2);


        this.gameView = cc.find('Canvas/Layout/gameView').getComponent("GameCtrl");
        this.endView = cc.find('Canvas/Layout/endView');
        var theCamera = cc.find("Canvas/Layout/cameraBox").getComponent("CameraCtrl");        
        cc.director.getPhysicsManager().attachDebugDrawToCamera(theCamera.camera);
        cc.director.getCollisionManager().attachDebugDrawToCamera(theCamera.camera);
    },

    start () {
        
    },

    update(dt){
        
         //-- 边界限制
         this.limitBorder();

        if(!this.gameView.fallFlag) return;

        //-- 方块运动
        this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.speedX,this.speedY);
        if(this.spawnFlag){
            this.gameView.box.getChildByName("guideBg").x = this.node.x;
        }
        
    },

    /**
     * 边界限制
     */
    limitBorder : function(){
        if ( this.node.x > this.maxPosX ) {
            this.node.x = this.maxPosX ;
            cc.log("碰到右边界")
        } else if (this.node.x < this.minPosX ) {
            this.node.x = this.minPosX;
            cc.log("碰到左边界")
        }
    },


    //-- 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        // cc.log(selfCollider.tag)
        var target = otherCollider.node.name;
         //-- 初始下落速度
         this.speedY = -150;

         //-- 初始s水平速度
         this.speedX = 0;

  

        if(this.spawnFlag){
            
            //-- 创建方块
            this.gameView.creatRoke();
            
            this.gameView.score.string =  Number( this.gameView.score.string)  + 1;
            //-- 只执行一次
            this.spawnFlag = false;
        }
     
        if(selfCollider.tag == 1){
   
            var rokeStonePre = cc.instantiate(this.gameView.rokeStonePre[this.node.name.split("roke")[1] - 1]);
            rokeStonePre.setPosition(selfCollider.node.x,selfCollider.node.y);
            rokeStonePre.rotation = selfCollider.node.rotation;
            this.gameView.rokeVineList.addChild(rokeStonePre);
            this.gameView.rokeListBox.removeChild(this.node);
            selfCollider.tag = 0;
        }

        

    },

    

    //-- 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        
    },




    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        
        var target = other.node.name

        switch(target){
            case "death" : 
                this.gameOver(other, self);
            break;
        }

    },

    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionStay: function (other, self) {
        
    },
    
    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
       
    },

    //-- 游戏结束 
    gameOver : function(other,self){
        var score = this.gameView.score
        if(Number(score.string) >0){
            score.string =  Number(score.string)  - 1;
        }
        if(this.deathFlag){
            this.dealLife(this.gameView.loves)
            this.deathFlag = false;
        }
        
        self.node.destroy();
        if(this.spawnFlag){
            //-- 创建方块
            this.gameView.creatRoke();
            
        }
    },

    //-- 生命消除
    dealLife : function(loves){
        for (var i = loves.length - 1; i >= 0; i--) {
            if(loves[i]!=null){
                var costBarAction = cc.sequence(cc.scaleTo(0.1,0),cc.callFunc(function(power){
                    power.destroy();
                },null,loves[i]));
                loves[i].runAction(costBarAction);
                loves[i] = null;
                break;
            }
        };
        // 游戏结束逻辑判断：能量条为空
        // if(loves[0]==null){
            cc.log("游戏结束")
            this.gameView.fallFlag = false;
            cc.director.getPhysicsManager().enabled = false;
            this.endView.active = true;
        // }
    },

});

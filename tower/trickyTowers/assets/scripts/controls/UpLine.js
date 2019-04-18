
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 普通碰撞开启检测
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;

        // 物理引擎随着相机动
        this.theCamera = cc.find("Canvas/Layout/cameraBox").getComponent("CameraCtrl");        
        cc.director.getPhysicsManager().attachDebugDrawToCamera(this.theCamera.camera);
        cc.director.getCollisionManager().attachDebugDrawToCamera(this.theCamera.camera);

        this.conts = 0;
        this.box = cc.find("Canvas/Layout/gameView/box"); 
        this.endView = cc.find("Canvas/Layout/endView");  

        this.index = 0;

        this.onceFlag = true;
    },

 

    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        // console.log('on collision enter');

    },

    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionStay: function (other, self) {
        // console.log('on collision stay');
        this.conts++;
        if(this.conts >= 100 && this.endView.active == false && this.onceFlag){
            this.index++;
            this.onceFlag  = false;

            var action1 = cc.moveBy(1,cc.p(0, 320));
            this.theCamera.camera.node.runAction(action1);

            // this.node.y += 350;

            var self = this
            var action2 = cc.sequence(cc.moveBy(1,cc.p(0, 320)),cc.callFunc(function(){
                self.onceFlag = true;
            }));

            this.box.runAction(action2);

            if(this.index >= 5){
                cc.find("Canvas/Layout/gameView").getComponent("GameCtrl").spawnBg(this.index)
            }
        }
    },
    
    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
        // console.log('on collision exit');
        this.conts = 0
    }


});

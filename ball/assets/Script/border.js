
cc.Class({
    extends: cc.Component,

    properties: {
        boomPrefab:cc.Prefab,
        deathCantainer:cc.Node,
    },



    onLoad () {
        //开启碰撞系统
        var manager = cc.director.getCollisionManager();    
        manager.enabled = true;
        // //开启碰撞调试
        // manager.enabledDebugDraw = true;         
    },

    /**
     * 普通碰撞回调
     */
    //当碰撞产生的时候调用
    onCollisionEnter:function (other, self){
        
    },

    //当碰撞结束后调用
    onCollisionExit: function (other, self) {
        if(self.node.group=="border"){
            other.node.destroy();
            this.onBorderAni(other.node);
        }
        
    },    

    //产生爆炸
    onBorderAni:function(node){
        var boom=cc.instantiate(this.boomPrefab);
        boom.parent=this.deathCantainer;
        boom.setPosition(node.getPosition());
        this.onBoomAni(boom);
    },

    //爆炸动画
    onBoomAni:function(boom){
        var fadeAni=cc.fadeOut(0.6,0);
        var call=cc.callFunc(function(){
            boom.destroy();
        }.bind(this));
        boom.runAction(cc.sequence(fadeAni,call));
    },


    // update (dt) {},
});

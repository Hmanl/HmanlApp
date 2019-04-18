
cc.Class({
    extends: cc.Component,

    properties: {
        bulletSpine_Prefab:cc.Prefab,
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
        if(other.node.group=="bullet"){
            this.bulletAni(self.node);
            self.node.destroy();
        }
          
    },

    //bullet动画
    bulletAni:function(node){
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        var bulletSpine=cc.instantiate(this.bulletSpine_Prefab);
        bulletSpine.parent=deathCantainer;
        bulletSpine.setPosition(node.getPosition());
        setTimeout(function(){
            bulletSpine.destroy();
        }.bind(this),500);
    },

    // update (dt) {},
});

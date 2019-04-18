
cc.Class({
    extends: cc.Component,

    properties: {
      
    },

   

    onLoad () {
        //开启碰撞系统
        var manager = cc.director.getCollisionManager();    
        manager.enabled = true;
        // //开启碰撞调试
        // manager.enabledDebugDraw = true;    
        this.role=cc.find("Canvas/gameView/role");
    },

     /**
     * 普通碰撞回调
     */
    //当碰撞产生的时候调用
    onCollisionEnter:function (other, self){
        if(other.node.group=="moster"){
            if(other.node.name!="boss"||other.node.name!="residual"){
                cc.find("Canvas/gameView").getComponent("game").onMosterDeath(other.node);   
            }
        }
    },


    update (dt) {
        if(this.node.name=="roleHitAni"){//扩散
            this.node.getComponent(cc.CircleCollider).radius+=4.5;
        }
        if(this.node.name=="shield"){//流行护体
            if(this.role){
                this.node.setPosition(this.role.getPosition());
            }
        }
    },

});

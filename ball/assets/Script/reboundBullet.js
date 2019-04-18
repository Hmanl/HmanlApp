
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
        this.reboundNum=0;//反弹次数
        this.tip=false;//碰到怪兽的标识
        var role=cc.find("Canvas/gameView/role");
        if(role){
            this.roleSp=cc.find("Canvas/gameView/role").getComponent("role");
        }
    },

    // 只在两个碰撞体开始接触时被调用一次
    onCollisionEnter:function (other, self){
        if(other.node.group=="moster"){
            this.tip=true;
            this.node.stopAllActions();
            this.reboundNum++;
            this.node.rotation=this.node.rotation+180;
            var angel=-this.node.rotation*(Math.PI / 180);
            var movetion=cc.moveBy(2,cc.v2(2000*Math.cos(angel),2000*Math.sin(angel)));
            var call=cc.callFunc(function(){
                this.node.destroy();
            }.bind(this));
            this.node.runAction(cc.sequence(movetion,call));
            
        }
        
    },
    // update (dt) {},
});

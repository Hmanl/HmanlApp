cc.Class({
    extends: cc.Component,

    properties: {
        radius:0,
        actName:[cc.String],                
    },

    start(){        
        this.center = cc.p(43,57);
    },
    
    jumpResult:function(targetPos){
        var vec = cc.pAdd(this.node.position,this.center);           
        var dis = cc.pDistance(vec,targetPos);        
        return dis < this.radius?true:false;
    },

    jumpPerfect:function(targetPos){
        var vec = cc.pAdd(this.node.position,this.center);           
        var dis = cc.pDistance(vec,targetPos);
        return dis < 15?true:false;
    },

    ready:function(){
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.animation = this.actName[0];
    },

    jump:function(){
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.animation = this.actName[1];
    },
    
});

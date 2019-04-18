
cc.Class({
    extends: cc.Component,

    properties: {
        bossDeathAni_Prefab:cc.Prefab,
        bossboom_Prefab:cc.Prefab,
        
        maxPosX:0,//屏幕最大宽度/2
        maxPosY:0,//屏幕最大高度/2
        mosterRadius:0,//怪兽半径
    },


    onLoad () {
        //开启碰撞系统
        var manager = cc.director.getCollisionManager();    
        manager.enabled = true;
        // //开启碰撞调试
        // manager.enabledDebugDraw = true;
        
        this.hitNum=0;//被撞击的次数 
        this.bossLive=true;//boss存活状态
        this.bossSpeed=3;//boss移速
        this.colortag=checkpoint%2==1?"红":"蓝";//boss颜色

        this.gameSp=cc.find("Canvas/gameView").getComponent("game");

        //boss技能
        this.schedule(function(){
            if(this.bossLive==true){
                this.bossSkill();
            }
        }.bind(this),5);    
    },


    /**
     * 普通碰撞回调
     */
    //当碰撞产生的时候调用
    onCollisionEnter:function (other, self){
        if(other.node.group=="bullet"){
            if(this.bossLive==true){
                this.hitNum++;
                cc.find("Canvas/gameView/bossProgress").getComponent(cc.ProgressBar).progress=(200*checkpoint-this.hitNum)/(200*checkpoint);
                //击中粒子动画
                this.gameSp.onBossBoom(self.node);
                other.node.destroy();
                if(this.hitNum==200*checkpoint){
                    this.gameSp.scoreAni(2000*checkpoint);
                    //关闭怪物量产开关
                    cc.find("Canvas/gameView/bossProgress").active=false;
                    cc.find("Canvas/gameView/bossProgress").getComponent(cc.ProgressBar).progress=1;
                    GenMoster=false;
                    bossPoint=false;
                    this.bossAni();
                }
            }
        }
    },  

    //boss技能
    bossSkill:function(){
        var fade_out=cc.fadeOut(0.3,0);
        var fade_in=cc.fadeIn(0.3,1);
        var call=cc.callFunc(function(){
            //撞击role
            this.bossSpeed=7;
            if(checkpoint%2==1){
                this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_R_speed",false);
            }else if(checkpoint%2==0){
                this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_B_speed",false);
            }
    
            this.scheduleOnce(function(){
                if(checkpoint%2==1){
                    this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_R",true);
                }else if(checkpoint%2==0){
                    this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_B",true);
                }
                this.bossSpeed=3;
            }.bind(this),1);
        }.bind(this));
        this.node.runAction(cc.sequence(fade_out,fade_in,fade_out,fade_in,call));
    },

    //boss动画
    bossAni:function(){
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        //设置boss状态和动作
        this.bossLive=false;
        this.node.parent=deathCantainer;

        //设置boss为初始状态
        if(checkpoint%2==1){
            this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_R_speed",false);
        }else if(checkpoint%2==0){
            this.node.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_B_speed",false);
        }

        var bossDeathAni=cc.instantiate(this.bossDeathAni_Prefab);
        var bossboom=cc.instantiate(this.bossboom_Prefab);
        bossDeathAni.parent=deathCantainer;
        bossboom.parent=this.node.getChildByName("ani");
        bossDeathAni.setPosition(this.node.getPosition());
        bossDeathAni.getComponent(sp.Skeleton).setAnimation(0,"boss_death01",true);
        if(checkpoint%2==1){
            bossboom.getComponent(sp.Skeleton).setAnimation(0,"octagon_R",true);
        }else if(checkpoint%2==0){
            bossboom.getComponent(sp.Skeleton).setAnimation(0,"octagon_B",true);
        }
        setTimeout(function(){
            //boss死亡动画
            this.bossDeathAni(bossDeathAni);
            this.gameSp.clearSpine(bossboom);
            bossboom.destroy();
            //boss消失
            this.gameSp.clearSpine(this.node.getChildByName("ani"));
            this.node.destroy();
            deathCantainer.removeAllChildren();//此步骤用来清空bossBody
        }.bind(this),3000);
    
    },

    //boss死亡动画
    bossDeathAni:function(bossDeathAni){
        bossDeathAni.getComponent(sp.Skeleton).setAnimation(0,"boss_death02",false);
        setTimeout(function(){
            bossDeathAni.destroy();
            //进入下一关
            cc.find("Canvas/gameView").getComponent("game").nextLevel();
        }.bind(this),800);
    },
      
    onbossMove:function(){
        var role_pos=cc.find("Canvas/gameView/role").getPosition();
        //设置bosshead的朝向
        var radio = (this.node.y - role_pos.y) / (this.node.x - role_pos.x); 
        var radian = Math.atan(radio);
        this.node.rotation = -(radian / Math.PI * 180) - 90;
        this.node.rotation = this.node.x - role_pos.x < 0 ? this.node.rotation + 180 : this.node.rotation;
    
        //设置bosshead X的动作
        if(role_pos.x>=this.node.x){
            if(role_pos.x-this.node.x>15){
                this.node.x-=-this.bossSpeed;
            }
        }
        else{
            if(role_pos.x-this.node.x<-15){
                this.node.x-=this.bossSpeed;
            }
        }
        //设置bosshead Y的动作
        if(role_pos.y>=this.node.y){
            if(role_pos.y-this.node.y>15){
                this.node.y-=-this.bossSpeed;
            }
        }
        else{
            if(role_pos.y-this.node.x<-15){
                this.node.y-=this.bossSpeed;
            }
        }
    },

    //角色边界判定
    limitBorder:function(){
        if(this.node.x>this.maxPosX-this.mosterRadius){
            this.node.x = this.maxPosX-this.mosterRadius;
        }
        if(this.node.x<-this.maxPosX+this.mosterRadius){
            this.node.x = -this.maxPosX+this.mosterRadius;
        }
        if(this.node.y>this.maxPosY-this.mosterRadius){
            this.node.y = this.maxPosY-this.mosterRadius;
        }
        if(this.node.y<-this.maxPosY+this.mosterRadius){
            this.node.y = -this.maxPosY+this.mosterRadius;
        }
    },

    update (dt) {
        if(isLive==true&&this.bossLive==true){
            this.onbossMove();
            this.limitBorder();
        }
    },

});


cc.Class({
    extends: cc.Component,

    properties: {

        maxPosX:0,//屏幕最大宽度/2
        maxPosY:0,//屏幕最大高度/2
        mosterRadius:0,//怪兽半径

        //怪兽类型
        type:"",
    },



    onLoad () {
        //开启碰撞系统
        var manager = cc.director.getCollisionManager();    
        manager.enabled = true;
        //开启碰撞调试
        // manager.enabledDebugDraw = true;  
        this.mosterLive=true;
        this.hitNum=0;//被撞击的次数        
        this.starSwitch=false;//星星移动的开关
        this.colortag=null;//颜色标识

        this.gameSp=cc.find("Canvas/gameView").getComponent("game");
        var role=cc.find("Canvas/gameView/role");
        if(role){
            this.roleSp=cc.find("Canvas/gameView/role").getComponent("role");
        }
    },

    destoryBullet: function(node){
        node.removeFromParent();
        switch(node.name){
            case "bullet":
                this.roleSp.directPool.put(node);
                break;  
            // case "reboundBullet":
            //     this.roleSp.reboundPool.put(node);
            //     break;  
            case "trackingBullet":
                this.roleSp.trackingPool.put(node);
                break;  
            case "bubbleBullet":
                this.roleSp.bubblePool.put(node);
                break;  
            default:
                node.destroy();
                break;
        }
    },

    /**
     * 普通碰撞回调
     */
    //当碰撞产生的时候调用
    onCollisionEnter:function (other, self){
        if(other.node.group=="bullet"){
            if(this.mosterLive==true){
                this.hitNum++;
                //子弹销毁
                if(other.node.name=="reboundBullet"){
                      //击中粒子动画
                    this.gameSp.onMosterBoom(self.node);  
                    if(other.node.getComponent("reboundBullet").reboundNum<=1){
                           //反弹不做处理
                    }
                    else{
                        this.destoryBullet(other.node);
                    }
                }
                else if(other.node.name=="laserBullet"){
                    //直接销毁当前节点
                    this.onLaserBulletFun(other,self);
                }
                else{
                    //击中粒子动画
                    this.gameSp.onMosterBoom(self.node,"moster");  
                    this.destoryBullet(other.node);
                }

                //如果是分裂怪生命值为20
                if(this.node.name=="splitMoster"){
                    if(this.hitNum==20){
                        this.gameSp.scoreAni(1000);
                        this.mosterHitDeath(other,self);
                        //碰到分裂怪,生成小方形怪
                        this.gameSp.onCreateSmallSplit(self.node);
                    }
                }
                //否则生命值为2
                else{
                    if(this.hitNum==1+checkpoint){
                        this.mosterHitDeath(other,self);
                    }
                }
            }   
        }
       
    },  

    //怪兽死亡统一逻辑
    mosterHitDeath:function(other,self){
        //装入死亡容器(防止子弹打击该目标)
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        self.node.parent=deathCantainer;
         //设置死亡状态
         this.mosterLive=false;
         //死亡动画
          this.gameSp.onMosterDeath(self.node);
         //渲染击杀数
         killNum++;
         if(killNum==100*checkpoint){//击杀50个生成boss    
             //生成boss
             cc.find("Canvas/gameView").getComponent("game").bossBorn();  
         }
    },

    //激光弹的逻辑
    onLaserBulletFun:function(other,self){
        if(this.node.name=="splitMoster"){
            this.mosterHitDeath(other,self);
            //碰到分裂怪,生成小方形怪
            this.gameSp.onCreateSmallSplit(self.node);
        }
        else{
            this.mosterHitDeath(other,self);
        }
    },

    //怪兽随机移动
    onMosterMove:function(){
        //设置怪兽的朝向
        var role_pos=cc.find("Canvas/gameView/role").getPosition();
        var radio = (this.node.y - role_pos.y) / (this.node.x - role_pos.x); 
        var radian = Math.atan(radio);
        this.node.rotation = -(radian / Math.PI * 180) - 90;
        this.node.rotation = this.node.x - role_pos.x < 0 ? this.node.rotation + 180 : this.node.rotation;
        
        //简单算法
        if(this.type=="moster"){
            //三角怪的移速
            this.node.x -= (role_pos.x>this.node.x)?-6:6;
            this.node.y -= (role_pos.y>this.node.y)?-6:6;
        }
        if(this.type=="squareMoster"){
            //方形怪的移速
            this.node.x -= (role_pos.x>this.node.x)?-3:3;
            this.node.y -= (role_pos.y>this.node.y)?-3:3;
        }
        if(this.type=="splitMoster"){
            //分裂怪的移速
            this.node.x -= (role_pos.x>this.node.x)?-1:1;
            this.node.y -= (role_pos.y>this.node.y)?-1:1;
        }
        if(this.type=="roundMoster"){
            //圆形怪的移速
            this.node.x -= (role_pos.x>this.node.x)?-2:2;
            this.node.y -= (role_pos.y>this.node.y)?-2:2;
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
        //怪兽追踪
        if(isLive==true&&this.mosterLive==true){
            this.onMosterMove();
            this.limitBorder();
        }
    
    },

});
    
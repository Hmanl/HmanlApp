
cc.Class({
    extends: cc.Component,

    properties: {
        //容器
        mosterContainer:cc.Node,
        bulletContainer:cc.Node,

        //子弹类型
        bulletPrefab:cc.Prefab,
        reboundBullet:cc.Prefab,
        trackingBullet:cc.Prefab,
        laserBullet:cc.Prefab,
        bubbleBullet:cc.Prefab,
        shield_Prefab:cc.Prefab,
        roleHitAni_Prefab:cc.Prefab,

        //子弹颜色类型
        directColor:[cc.SpriteFrame],
        trackingColor:[cc.SpriteFrame],
        reboundColor:[cc.SpriteFrame],
        laserColor:[cc.SpriteFrame],
        bubbleColor:[cc.SpriteFrame],

        camera:cc.Node,
        gameView:cc.Node,
        overView:cc.Node,
        energyView:cc.Node,
        mask:cc.Node,
        dot:cc.Node,//遥感按钮
        gameCrlLeft:cc.Node,

        maxPosX:0,//屏幕最大宽度/2
        maxPosY:0,//屏幕最大高度/2
        roleRadius:0,//角色半径
    },


    onLoad () {
        //开启碰撞系统
        var manager = cc.director.getCollisionManager();    
        manager.enabled = true;
        // //开启碰撞调试
        // manager.enabledDebugDraw = true;    
        //开启物理系统
        cc.director.getPhysicsManager().enabled = true;
        //配置调试信息
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_pairBit |
        cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit;       

        this.gameView.on(cc.Node.EventType.TOUCH_START,this.touchStart,this);
        this.gameView.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove,this);
        this.gameView.on(cc.Node.EventType.TOUCH_END,this.touchEnd,this);

        this.aimNode=null;//目标位置
        this.crl_point=null;//追踪曲线控制点的位置
        this.speed=0;
        this.angle=0;
        //子弹缓存池
        this.onCreateBulletPool();
        this.gameViewSp=this.gameView.getComponent("game");

    },
    
    start:function(){
        this.createLargeBullet();//子弹量产器
    },

    //子弹缓存池
    onCreateBulletPool:function(){
        //直射对象池
        this.directPool = new cc.NodePool();
        for (let i = 0; i < 15; i++) {
            let directBullet = cc.instantiate(this.bulletPrefab); // 创建节点
            this.directPool.put(directBullet); // 通过 putInPool 接口放入对象池
        }
        //追踪对象池
        this.trackingPool = new cc.NodePool();
        for (let i = 0; i < 15; i++) {
            let trackingBullet = cc.instantiate(this.trackingBullet); // 创建节点
            this.trackingPool.put(trackingBullet); // 通过 putInPool 接口放入对象池
        }
        //反弹对象池
        this.reboundPool = new cc.NodePool();
        for (let i = 0; i < 15; i++) {
            let reboundBullet = cc.instantiate(this.reboundBullet); // 创建节点
            this.reboundPool.put(reboundBullet); // 通过 putInPool 接口放入对象池
        }
        //泡泡对象池
        this.bubblePool = new cc.NodePool();
        for (let i = 0; i < 15; i++) {
            let bubbleBullet = cc.instantiate(this.bubbleBullet); // 创建节点
            this.bubblePool.put(bubbleBullet); // 通过 putInPool 接口放入对象池
        }
    },

    
     /**
     * 普通碰撞回调
     */
    //当碰撞产生的时候调用
    onCollisionEnter:function (other, self){
        if(other.node.group=="moster"){
            //碰到怪兽
            if(other.node.name=="boss"||other.node.name=="residual"){
                cc.log("role当场死亡");
                this.overGame();          
            }
            else{
                var mosterLive=other.node.getComponent("moster").mosterLive;
                if(mosterLive==true){
                    this.hitMosFun();
                }
            }
        }
    },

   
    touchStart:function(e){
        var pos=e.touch._point;
        if(pos.x<cc.winSize.width*0.5&&!this.gameCrlLeft.activeInHierarchy){
            this.gameCrlLeft.active=true;
            this.gameCrlLeft.setPosition(this.gameView.convertToNodeSpaceAR(pos));
        }
    },

    touchMove:function(event){
        var touchPos = this.gameCrlLeft.convertToNodeSpaceAR(event.getLocation());
        var distance = this.getDistance(touchPos, cc.p(0, 0));
        var radius=100;
        // 由于摇杆的postion是以父节点为锚点，所以定位要加上ring和dot当前的位置(stickX,stickY)
        var posX = touchPos.x;//this.gameCrlLeft.getPosition().x
        var posY = touchPos.y;
        if(radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
        }else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = Math.cos(this.getRadian(cc.p(posX, posY))) * radius;
            var y = Math.sin(this.getRadian(cc.p(posX, posY))) * radius;
            this.dot.setPosition(cc.p(x, y));
        }
        //更新角度
        this.getAngle(cc.p(posX, posY));
        //设置实际速度
        this.setSpeed(cc.p(posX, posY));
    },

    touchEnd:function(){
        this.dot.setPosition(cc.v2(0,0));
        this.speed = 0;
        this.gameCrlLeft.active=false;
    },

     //移动角色节点
    roleMove:function(){
        this.node.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.node.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;
        this.camera.x+= Math.cos(this.angle * (Math.PI / 180)) * this.speed*0.8;
        this.camera.y+= Math.sin(this.angle * (Math.PI / 180)) * this.speed*0.8;
    },

    //计算两点间的距离并返回
    getDistance: function (pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    },

    //计算弧度并返回
    getRadian: function (point) {
        this.radian = Math.PI / 180 * this.getAngle(point);
        return this.radian;
    },
     
    //计算角度并返回
    getAngle: function (point) {
        this.angle = Math.atan2(point.y , point.x ) * (180 / Math.PI);
        return this.angle;
    },

    
    //设置实际速度
    setSpeed: function (point) {
        //触摸点和遥控杆中心的距离
        var distance = this.getDistance(point, this.gameCrlLeft.getPosition());
        //如果半径
        if (distance < 100) {
            this.speed = 1;
        } else {
            this.speed = 10;
        }
       
    },


    //子弹量产器
    createLargeBullet:function(){
        /**
         * 直射子弹
         */
        //生成子弹(普通射速)
        this.schedule(function(){
            if(skillType.direct==true){
                var length=this.mosterContainer.children.length;
                if(length>0&&isLive==true){
                    this.onCreatebullet();   
                }
            }   
        }.bind(this),0.1);
        /**
         * 追踪子弹
         */
         //生成子弹(普通射速)
         this.schedule(function(){
            if(skillType.tracking==true){
                var length=this.mosterContainer.children.length;
                if(length>0&&isLive==true){
                    this.onCreateTrackingBullet();   
                }
            }   
        }.bind(this), 0.1);
        /**
         * 反弹子弹
         */
         //生成子弹(普通射速)
         this.schedule(function(){
            if(skillType.rebound==true){
                var length=this.mosterContainer.children.length;
                if(length>0&&isLive==true){
                    this.onCreateReboundBullet();   
                }
            }   
        }.bind(this),0.05);
        /**
         * 激光子弹
         */
        //生成子弹(普通射速)
        this.schedule(function(){            
            if(skillType.laser==true){
                var length=this.mosterContainer.children.length;                
                if(length>0&&isLive==true){
                    this.onCreateLaserBullet();   
                }
            }   
        }.bind(this),0.5);
        /**
         * 泡泡子弹
         */
        //生成子弹(普通射速)
        this.schedule(function(){
            if(skillType.bubble==true){
                var length=this.mosterContainer.children.length;
                if(length>0&&isLive==true){
                    this.onCreateBubbleBullet();   
                }
            }   
        }.bind(this),0.1);
    },
    /**
     * 
     *直射子弹************************************************ 
     * 
     */
    //生成子弹
    onCreatebullet:function(){
        for(var i=0;i<2;i++){
            var flag = 0;
            if (this.directPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                var bullet = this.directPool.get();  
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                var bullet=cc.instantiate(this.bulletPrefab);
            }
            bullet.parent=this.bulletContainer;
             //改变子弹类型        
            this.switchColor(bullet,this.directColor,"direct");

            this.onBulletAction(bullet,i);
            
        }    

    },  

    //子弹运动(左键自瞄)
    onBulletAction:function(bullet,i){
        var aimNode=this.onGetMinDis();//得到目标节点
        var aim_pos=aimNode.getPosition();

        //role的朝向
        var roleDic=this.onRoleDic(aim_pos);
        //子弹的角度
        bullet.rotation=roleDic;  

        var angel= -bullet.rotation*(Math.PI / 180);

        if(i==0){
            bullet.setPosition(cc.v2(this.node.x+30*Math.cos(90+angel),this.node.y+30*Math.sin(90+angel)));
        }
        else{
            bullet.setPosition(cc.v2(this.node.x+30*Math.cos(180+angel),this.node.y+30*Math.sin(180+angel)));
        }

        var distance=cc.pDistance(this.node.getPosition(),aim_pos);
        var ratio=distance/2000;
        var moveAction=cc.moveTo(1*ratio,cc.v2(aim_pos.x,aim_pos.y));
        var call=cc.callFunc(function(){
            this.directPool.put(bullet);
        }.bind(this));

        bullet.stopAllActions();
        bullet.runAction(cc.sequence(moveAction,call));
 
    },

    /**
     * 
     *追踪子弹************************************************ 
     * 
     */
    //生成子弹
    onCreateTrackingBullet:function(){
        for(var i=0;i<2;i++){
            var role_pos=this.node.getPosition();
            if (this.trackingPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                var bullet = this.trackingPool.get();  
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                var bullet=cc.instantiate(this.trackingBullet);
            }
            if(bullet){
                bullet.parent=this.bulletContainer;
            }
            bullet.setPosition(role_pos);

            if(i==0){
                this.crl_point=cc.p(1,0);
            }
            else{
                this.crl_point=cc.p(0,1);
            }

              //改变子弹类型        
            this.switchColor(bullet,this.trackingColor,"tracking");

            this.onTrackingBulletAction(bullet);
            
        }
        
    },     

    
    //子弹运动(左键自瞄)
    onTrackingBulletAction:function(bullet){
        var aimNode=this.onGetMinDis();//得到目标节点
        var aim_pos=aimNode.getPosition();
        var distance=cc.pDistance(cc.v2(aim_pos.x,aim_pos.y),this.node.getPosition());
        var ratio=distance/2000;
        var role_pos = this.node.getPosition();

        var bezier = [cc.p(role_pos.x + this.crl_point.x * (aim_pos.x - role_pos.x), role_pos.y + this.crl_point.y * (aim_pos.y - role_pos.y)), aim_pos, aim_pos];
        var moveAction = cc.bezierTo(1.5*ratio, bezier);
       
        var call=cc.callFunc(function(){
            this.trackingPool.put(bullet);
        }.bind(this));
        bullet.stopAllActions();
        bullet.runAction(cc.sequence(moveAction,call));

       //role的朝向
       var roleDic=this.onRoleDic(aim_pos);
       bullet.rotation=roleDic;   
    },

    /**
     * 
     *反弹子弹************************************************ 
     * 
     */
    //生成子弹
      onCreateReboundBullet:function(){
        var role_pos=this.node.getPosition();
        if (this.reboundPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            var bullet = this.reboundPool.get();  
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            var bullet=cc.instantiate(this.reboundBullet);
        }
        if(bullet){
            bullet.parent=this.bulletContainer;
        }
        bullet.setPosition(role_pos);

        //改变子弹类型        
        this.switchColor(bullet,this.reboundColor,"rebound");

        this.onReboundBulletAction(bullet);
 
    },
    

    
     //子弹运动(左键自瞄)
     onReboundBulletAction:function(bullet){
        var aimNode=this.onGetMinDis();//得到目标节点
        var aim_pos=aimNode.getPosition();
        var distance=cc.pDistance(cc.v2(aim_pos.x,aim_pos.y),this.node.getPosition());
        var ratio=distance/2000;
        var moveAction=cc.moveTo(1*ratio,cc.v2(aim_pos.x,aim_pos.y));
        var call=cc.callFunc(function(){
            if(bullet.getComponent("reboundBullet").tip==false){
                this.reboundPool.put(bullet);
            }
        }.bind(this));

        bullet.runAction(cc.sequence(moveAction,call));

        //role的朝向
        var roleDic=this.onRoleDic(aim_pos);
        bullet.rotation=roleDic;    
    },  

    /**
     * 
     *激光子弹**********************************************
     * 
     */
    //生成子弹
    onCreateLaserBullet:function(){
        var laserBullet=cc.instantiate(this.laserBullet);
        laserBullet.parent=this.node;
        //改变子弹类型        
        this.switchColor(laserBullet,this.laserColor,"laser");
        this.onLaserBulletAction(laserBullet);
    },  

    //子弹运动(左键自瞄)
    onLaserBulletAction:function(bullet){
        var aimNode=this.onGetMinDis();//得到目标节点
        var aim_pos=aimNode.getPosition();

        //role的朝向
       var radio = (this.node.y - aim_pos.y) / (this.node.x - aim_pos.x); 
       var radian = Math.atan(radio);
       this.node.rotation = -(radian / Math.PI * 180) - 180;
       //role的角度
       this.node.rotation = this.node.x - aim_pos.x < 0 ? this.node.rotation + 180 : this.node.rotation;    

       var scaleAction=cc.scaleTo(0.2,60,1);
       var call=cc.callFunc(function(){
            bullet.destroy();
       }.bind(this));
       bullet.runAction(cc.sequence(scaleAction,call));

    },


    /**
     * 
     *泡泡子弹************************************************ 
     * 
     */
    //生成子弹
    onCreateBubbleBullet:function(){
        var role_pos=this.node.getPosition();
        if (this.bubblePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            var bubbleBullet = this.bubblePool.get();  
            bubbleBullet.scale=1;
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            var bubbleBullet=cc.instantiate(this.bubbleBullet);
        }
        if(bubbleBullet){
            bubbleBullet.parent=this.bulletContainer;
        }
        bubbleBullet.setPosition(role_pos);

        //改变子弹类型        
        this.switchColor(bubbleBullet,this.bubbleColor,"bubble");

        this.onBubbleBulletAction(bubbleBullet);
 
    },
    
    
     //子弹运动(左键自瞄)
     onBubbleBulletAction:function(bullet){
        var aimNode=this.onGetMinDis();//得到目标节点
        var aim_pos=aimNode.getPosition();
        var distance=cc.pDistance(cc.v2(aim_pos.x,aim_pos.y),this.node.getPosition());
        var ratio=distance/2000;
        var moveAction=cc.moveTo(1*ratio,cc.v2(aim_pos.x,aim_pos.y));
        var scaleAciton=cc.scaleTo(1*ratio,3);
        var call=cc.callFunc(function(){
            this.bubblePool.put(bullet);
        }.bind(this));
        bullet.stopAllActions();
        bullet.runAction(cc.sequence(cc.spawn(moveAction,scaleAciton),call));
        var roleDic=this.onRoleDic(aim_pos);
        bullet.rotation=roleDic;   
    },  

    //role的朝向
    onRoleDic:function(aim_pos){
        var radio = (this.node.y - aim_pos.y) / (this.node.x - aim_pos.x); 
        var radian = Math.atan(radio);
        this.node.rotation = -(radian / Math.PI * 180) - 180;
        this.node.rotation = this.node.x - aim_pos.x < 0 ? this.node.rotation + 180 : this.node.rotation;    
        return this.node.rotation;
    },


    //子弹颜色切换
    switchColor:function(bullet,colorSptiteArr,bulletType){
        var checkpointNum=checkpoint%4+1;//(checkpointNum取值范围为1-4)
        if(bulletType=="direct"||bulletType=="tracking"||bulletType=="rebound"){
            //绿色--蓝色--紫色--橙色
            bullet.getComponent(cc.Sprite).spriteFrame=colorSptiteArr[Math.floor(Math.random()*3+3*(checkpointNum-1))];    //Math.floor(Math.random() * (31 - 25) + 25) 
        }
        else if(bulletType=="laser"||bulletType=="bubble"){
            //绿色--蓝色--紫色--橙色
            bullet.getComponent(cc.Sprite).spriteFrame=colorSptiteArr[checkpointNum-1];    
        }
    },

    /******************************************************************************************** */

    //检测怪兽与人物的最短距离
    onGetMinDis:function(){ 
        var minDistance=3000;//角色与怪兽的最小距离
        var index=0;//索引
        var mosArr=this.mosterContainer.children;
        for(var i=0;i<mosArr.length;i++){
            var distance=cc.pDistance(this.node.getPosition(),mosArr[i].getPosition());
            if(minDistance>distance){
                minDistance=distance;
                index=i;
            }    
        }
        return mosArr[index];
    },
    
    //人物撞到moster
    hitMosFun:function(){
        if(invincible==false){
            energyNum--;
            energyNum<=0?this.overGame:this.onRenderEnergy();
        }
    },

    //能量值渲染
    onRenderEnergy:function(){
        this.energyView.children[energyNum].active=false;
        this.roleHitAni();//扩散动画
    },

    //角色hit动画
    roleHitAni:function(){
        var roleHit=cc.instantiate(this.roleHitAni_Prefab);
        roleHit.parent=this.node;
        invincible=true;
        this.shieldFun();
        this.scheduleOnce(function(){
            roleHit.destroy();
        }.bind(this),1);
    },

    //流行护体
    shieldFun:function(){
        var deathContainer=cc.find("Canvas/gameView/container/deathCantainer");
        var shield=cc.instantiate(this.shield_Prefab);
        shield.parent=deathContainer;
        this.scheduleOnce(function(){
            invincible=false;
            shield.destroy();
        }.bind(this),8);
    },

     //角色边界判定
     limitBorder:function(){
        if(this.node.x>this.maxPosX-this.roleRadius){ 
            this.node.x = this.maxPosX-this.roleRadius;
            this.gameViewSp.limitcamera("right");
        }
        if(this.node.x<-this.maxPosX+this.roleRadius){
            this.node.x = -this.maxPosX+this.roleRadius;
            this.gameViewSp.limitcamera("left");
        }
        if(this.node.y>this.maxPosY-this.roleRadius){
            this.node.y = this.maxPosY-this.roleRadius;
            this.gameViewSp.limitcamera("top");
        }
        if(this.node.y<-this.maxPosY+this.roleRadius){
            this.node.y = -this.maxPosY+this.roleRadius;
            this.gameViewSp.limitcamera("down");  
        }
    },

    update (dt) {
        this.roleMove();
        //角色边界移动
        this.limitBorder();
    },
    //游戏结束
    overGame:function(){
        isLive=false;
        this.mask.active=true;
        var fade_out=cc.fadeOut(0.8,0);
        this.gameViewSp.roleDeathAni(this.node);
        var call=cc.callFunc(function(){
            this.mask.active=false;
            this.overView.active=true;
            if(this.node){
                this.node.destroy();
            }
        }.bind(this));
        this.node.runAction(cc.sequence(fade_out,call));
    },

});

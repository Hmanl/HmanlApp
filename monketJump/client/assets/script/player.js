
cc.Class({
    extends: cc.Component,

    properties: {
        platforms:cc.Node,
        foods:cc.Node,
        npc:cc.Node,
        particles:cc.Node,
        canvas:cc.Node,
        camera:cc.Node,
        wall:[cc.Node],
        backGround:cc.Node,
        ground:cc.Node,
        boss:cc.Node,
        pjt:cc.Node,
        spt:cc.Node,                       
        prefab:[cc.Prefab],        
        itemTex:[cc.SpriteFrame],
        branch:[cc.SpriteFrame],
        tex:[cc.SpriteFrame],
        audios:[cc.AudioClip],
        vedioBn:cc.Node,
        reviveBn:cc.Node,
        scoreInfo:cc.Node, //分数详情
        numPrefab:cc.Prefab, //数字
        trySprite:[cc.SpriteFrame],
        trySprite:[cc.SpriteFrame],
        skinSeatSprite:[cc.SpriteFrame],
        tryButton:cc.Sprite,
        trybuttonSprite:[cc.SpriteFrame],
        getskinPopup:cc.Node, //得到皮肤详情
        tip:cc.Node,//分享获得提示
        ach_box:cc.Node,//成就box
    },
    
    onLoad(){
        cc.director.getPhysicsManager().enabled = true; 
        var canvas = this.canvas.getComponent(cc.Canvas);

        //机器人动画开关
        this.robatSwitch=false;
        this.robatIndex=0;

        //适配
        if(!cc.sys.isMobile){            
            canvas.fitHeight = true;
        }   
        
         //星星bug增益
         var starBuff=localStorage.getItem('starBuff');
         if(starBuff){
            cc.find("Canvas/score/X3").active=true;
         }
         this.init();
    },
    
    init() {
        var playerInfo = localStorage.getItem('playerInfo5');
        if(playerInfo){
            this.playerInfo = JSON.parse(playerInfo); 
            this.playerInfo.tryskin[this.playerInfo.skin] = 2; 
        }else{
            this.playerInfo = {            
                nickName:'sb',
                diamond:0,
                date:0,
                share:0,
                skin:0,
                revive:3,
                star:0,              
                skinLocks:[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            }
        }
        var subCanvas = this.canvas.getChildByName('subCanvas');
        subCanvas.active = true;
        this.canvas.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
        this.rigidBody = this.node.getComponent(cc.RigidBody);                
        this.loadText();
        this.loadRobot();
        this.setInput();
        this.platList = [];
        this.foodList = [];                     
        this.matrixs = [];        
        this.score = 0;        
        this.rag = 0;
        this.state = 0;
        this.food = 0;
        this.food2 = 0;
        this.time = 10000;
        this.rocket = 10000;        
        this.magnet = 10000;
        this.ultimate = false;        
        this.shield = false;
        this.lv = 0;
        this.iCount = "";
        this.lock = true;
        this.saveNum = 0;//保存上一次分数
        this.mt = 50;
        this.scene = 0;
        this.scene2 = 0;
        this.order = [];                        
        this.setWallSize();                      
        this.camera.setPosition(cc.winSize.width*0.5,cc.winSize.height*0.5);                      
        this.createPlatformPool();         
        for(var i= 0;i<2;i++){
            this.spawnPlatformMatrix(10*i);
        }          
        this.createMatrix(); //配置奖励坐标      
        cc.audioEngine.playMusic(this.audios[0],true);                   
        this.canvas.getChildByName('mask').setContentSize(cc.winSize);
        this.canvas.getChildByName('paused').children[0].setContentSize(cc.winSize);
        this.canvas.getChildByName('screenEffect').setContentSize(cc.winSize);
        this.canvas.getChildByName('getSkin').getChildByName('bg').setContentSize(cc.winSize);
        this.setSkeletonData(this.node.getChildByName('body'),"playerSpine/"+playerSpine[this.playerInfo.skin],skins[this.playerInfo.skin][0],null,1,true);
        this.setAttentionFish();
        if(!cc.sys.isMobile){
            this.canvas.getChildByName('notice3').getComponent(cc.Label).string = lx.i18n.t("label_text.gametip")
            this.canvas.getChildByName('notice2').active = false; 
            this.canvas.getChildByName('notice3').active = true;
            //注册电脑点击事件
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }              
        //微信,脸书的广告功能
        this.hp = lx.config.adUnitId ? 1 : 0;
        this.changeSkinPop();
        this.exceedRobot("start");
        this.initCommonData();
    },  
    
    //初始化全局信息
    initCommonData:function(){
        ach_data.star=0,
        ach_data.checkpoint=1,
        ach_data.score=0,
        ach_data.platform=0,
        ach_data.rocket=0
    },

    //改变皮肤得到框语言
    changeSkinPop:function(){
        var panel = this.canvas.getChildByName('getSkin');          
        if(lx.language == "en"){
            panel.getChildByName("effect").getComponent(sp.Skeleton).animation = "new_skin_E";
        }else{
            panel.getChildByName("effect").getComponent(sp.Skeleton).animation = "new_skin";
        }
        panel.getChildByName("text").string = lx.i18n.t("label_text.getSkinTip");
        panel.getChildByName("use").getChildByName("text").string = lx.i18n.t("label_text.getSkinLeft");
        panel.getChildByName("parade").getChildByName("text").string = lx.i18n.t("label_text.getSkinRight");
        panel.getChildByName("jumpOut").string = lx.i18n.t("label_text.jumpOut");
    },

    update (dt) {
        this.cameraFollow();
        this.setRocket(dt);
        this.setMagnet(dt);
        this.setTime(dt);
        this.warring();

        if(!cc.sys.isMobile){
            if(Math.abs(this.input)> 0){
                this.rigidBody.linearVelocity = cc.v2(500 * this.input,this.rigidBody.linearVelocity.y);
            }else{
                this.rigidBody.linearVelocity = cc.v2(0 ,this.rigidBody.linearVelocity.y);
            }           
        }

    },

    playAnim(i){
        var spine = this.node.children[i+1].getComponent(sp.Skeleton);
        spine.loop = true;
        spine.animation = this.itemsName[i];
    },    

    //设置控制感应事件
    setInput(){
        if(typeof(sharedCanvas) == 'undefined'){
            cc.systemEvent.setAccelerometerEnabled(true);
            cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION,function(res){
                this.rigidBody.linearVelocity = cc.v2(3000*res.acc.x,this.rigidBody.linearVelocity.y);
            }, this);
        }else{            
            wx.startAccelerometer({
                interval:'game',            
            });
            wx.onAccelerometerChange(function(res){            
                if(this.rigidBody){
                    this.rigidBody.linearVelocity = cc.v2(3000*res.x,this.rigidBody.linearVelocity.y);
                }
            }.bind(this));
            wx.setKeepScreenOn({keepScreenOn:true});
        }    
    },

    //设置倒计时关卡
    setTime(dt){
        if(this.time < 15){
            this.time += dt;
            var tNode = this.canvas.getChildByName('time');
            tNode.active = true;
            var t = 15 - Math.floor(this.time);
            if(this.time >= 10){
                tNode.color = new cc.Color(255,0,0);
            }                
            tNode.getComponent(cc.Label).string = t.toString();           
            if(this.time >= 15){//这里结束场景
                if(this.bannerAd){
                    this.bannerAd.hide();
                }
                this.replaceScenes(0);
                tNode.active = false;                
            }
        }
    },

    //设置火箭
    setRocket(dt){
        if(this.rocket < 6){
            this.rocket += dt;            
            if(this.rocket >= 6){
                this.node.getChildByName('rocket').getComponent(sp.Skeleton).animation = null;
                this.closeEffect();
                if(this.state == 2){                    
                    this.state = 0;
                    this.node.getChildByName('body').stopAllActions();
                    this.node.getChildByName('body').color = new cc.Color(255,255,255);
                }                
            }
            this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x,1500);
        }               
    },

    //设置磁铁
    setMagnet(dt){
        if(this.magnet < 4){
            this.magnet += dt;
            if(this.magnet >= 4){
                this.node.getChildByName('magnet').getComponent(sp.Skeleton).animation = null;
                this.closeEffect();                       
            }
            for(var i = 0;i<this.foods.children.length;i++){
                var dis = this.node.position.sub(this.foods.children[i].position).mag();
                if(dis<200){                                          
                    var dir = this.node.position.sub(this.foods.children[i].position).normalize();
                    var rigidBody = this.foods.children[i].getComponent(cc.RigidBody);
                    rigidBody.linearVelocity = dir.mul(1750);                  
                }
            }        
        }
    },

    //关闭动画
    closeEffect(){
        this.node.getChildByName('fly').getComponent(sp.Skeleton).animation = null;           
        if(this.ultimate){
            this.ultimate = false;
            var pgbNode = this.canvas.getChildByName('score').getChildByName('progressBar');
            pgbNode.children[0].getComponent(sp.Skeleton).loop = false;
            pgbNode.children[0].getComponent(sp.Skeleton).animation = 'energy_end';            
        }
    },
    
    //设置乌贼
    setAttentionFish(){
        var length = cc.winSize.width+this.npc.width;
        this.npc.type = 30;
        var action = cc.repeatForever(cc.sequence(
            cc.moveBy(4.5, length, 0),
            cc.moveBy(4.5, length*-1, 0)
        ));
        this.npc.runAction(action);
        this.npc.active = false;
    },

    //设置墙壁碰撞刚体的长度
    setWallSize(){
        for(var i = 0;i<this.wall.length;i++){
            var box = this.wall[i].getComponent(cc.PhysicsBoxCollider);
            box.size.height = cc.winSize.height;
            box.apply();
            this.wall[i].y = cc.winSize.height*0.5;           
        }
    },

    //移动背景的几个树枝
    moveBackGround(y){
        this.backGround.children[4].height = y%2272+3408;   
        this.backGround.children[3].height = y%2272+3408;
        this.backGround.children[2].height = y*0.5%2272+3408;
        this.backGround.children[1].height = y*0.25%2272+3408;              
    },

    //产生台阶对象池
    createPlatformPool(){
        this.platformPool = new cc.NodePool();
        this.foodPool = new cc.NodePool();       
        this.ptcPool = new cc.NodePool();
        this.pjtPool = new cc.NodePool();        
        this.splinterPool = new cc.NodePool();               
        for(var j = 0;j < 20;j++){
            var platform = cc.instantiate(this.prefab[0]);
            this.platformPool.put(platform);
            var food = cc.instantiate(this.prefab[1]);
            this.foodPool.put(food);
            if(j < 10){
                var ptc = cc.instantiate(this.prefab[2]);
                this.ptcPool.put(ptc);
                if(j < 5){                
                    var pjt = cc.instantiate(this.prefab[3]);
                    this.pjtPool.put(pjt);
                    var spt = cc.instantiate(this.prefab[4]);
                    this.splinterPool.put(spt);                                  
                } 
            }                                  
        }      
    },   

    //触屏开始
    touchStart(){
        this.ground.type = 50;
        var point = this.rigidBody.getWorldCenter();
        this.rigidBody.applyLinearImpulse(cc.v2(0,3800),point,true);//给role一个冲量         
        this.canvas.getChildByName('notice').destroy();   
        this.canvas.off(cc.Node.EventType.TOUCH_START,this.touchStart,this);
    },

    touchMove(event){
        var startPos = event.getStartLocation();
        var prePos = event.getPreviousLocation();
        startPos = cc.v2(startPos.x,startPos.y);
        prePos = cc.v2(prePos.x,prePos.y);
        var dis = prePos.sub(startPos).mag() * 0.01;
        dis > 1 ? this.zoom = 1 : this.zoom = dis;
        if(dis > 0){
            this.dir = prePos.sub(startPos).normalize();
            var c = Math.sign(this.dir.x);
            this.zoom *= c;
            if(this.state)
            this.status = 1;
        }
        event.stopPropagation();     
    },

    touchEnd(){        
        this.status = 0;
        event.stopPropagation();
    },

    onKeyDown(event){
        switch(event.keyCode){
            case 68:
            this.input = 1;
            break;
            case 65:
            this.input = -1;            
            break;
        }
    },
    
    onKeyUp(event){
        switch(event.keyCode){
            default:
            this.input = 0;            
        }
    },
    
    onBeginContact:function(contact, selfCollider, otherCollider){
        var angle = this.rigidBody.linearVelocity.signAngle(cc.v2(1,0));
        angle = angle * 180/Math.PI;
        var starBuff=localStorage.getItem('starBuff');
        switch(otherCollider.node.type){            
            case 0://星星
            if(starBuff){
                this.addFood(3,otherCollider.node,false);
                ach_data.star+=3;
            }
            else{
                this.addFood(1,otherCollider.node,false);
                if(ach_data.star>2000){
                    this.queryAchList(1);
                    if(ach_data.star>3000){
                        this.queryAchList(6);
                    }
                }
                ach_data.star++;
            }
            if(ach_data.star>2000){
                this.queryAchList(1);
                if(ach_data.star>3000){
                    this.queryAchList(6);
                }
            }
            this.updateProgressBar();                                
            break;
            case 1://高分星
            if(starBuff){
                this.addFood(3,otherCollider.node,true);
            }
            else{
                this.addFood(1,otherCollider.node,true);
            }
            this.updateProgressBar();
            break;
            case 2://火箭   
            if(ach_data.rocket>=5){
                this.queryAchList(5);
                if(ach_data.rocket>=15){
                    this.queryAchList(10);
                }
            }
            ach_data.rocket++;      
            if(this.state == 1){
                this.state == 0;
                this.node.getChildByName('shield').getComponent(sp.Skeleton).animation = null;
            }
            this.rocket = 0;                    
            this.getItem(0,otherCollider.node);            
            break;
            case 3://磁铁
            this.magnet = 0;
            this.getItem(1,otherCollider.node);
            break;
            case 4://盾牌
            if(this.state == 1)
                this.state == 0;
            this.shield = true;
            this.getItem(2,otherCollider.node);
            break;
            case 5: //无敌星星          
            this.whosYourDaddy();     
            this.getItem(0,otherCollider.node);                                                    
            break;
            case 6://冰手里剑
            if(starBuff){
                this.addFood(3,otherCollider.node,false);
            }
            else{
                this.addFood(1,otherCollider.node,false);
            }
            if(this.boss.activeInHierarchy)      
            this.boss.getComponent('bigFish').playAnim(4,false);   
            break;
            case 7://扔炸弹
            if(starBuff){
                this.addFood(3,otherCollider.node,false);
            }
            else{
                this.addFood(1,otherCollider.node,false);
            }
            this.projectile(0);
            break;
            case 8://扔铁块
            if(starBuff){
                this.addFood(3,otherCollider.node,false);
            }
            else{
                this.addFood(1,otherCollider.node,false);
            }
            this.projectile(1);
            break;                                                    
            case 30:
            if(angle < 0){
                this.addForce(3800);
                otherCollider.node.active = false;
                this.spawnParticle(otherCollider.node.position);
            }else{
                if(this.state == 2){
                    otherCollider.node.active = false;
                    this.spawnParticle(otherCollider.node.position);
                }else{
                    if(this.shield){
                        this.breakShield();            
                        this.shield = false;
                        otherCollider.node.active = false;                        
                    }else{
                        this.vertigo();
                    }
                }                                
            }            
            break;
            case 31://boss
            var bigFish = this.boss.getComponent('bigFish');
            if(bigFish.state == 0){
                if(this.state != 2){               
                    if(this.shield){
                        this.addForce(5500);
                        this.breakShield();                                                           
                        this.shield = false;
                    }else{
                        this.node.active = false; 
                        this.state = 1;                   
                        bigFish.playAnim(7,false);
                    }                                            
                }
            }else{
                this.addForce(5500);
            }                                
            break;
            case 32://地刺
            if(this.state != 2){
                if(this.shield){
                    this.breakShield();           
                    this.shield = false;
                }else{
                    this.vertigo();                   
                }                
            }            
            break;
            case 33://乌贼
            if(this.state != 2){
                if(this.shield){
                    this.breakShield();           
                    this.shield = false;
                }else{
                    this.vertigo();                   
                }
                otherCollider.node.active = false;
            }
            break;
            case 50://普通台阶和运动台阶
            angle < 0 ?this.addForce(3800):contact.disabled = true;            
            break;
            case 51://破碎台阶
            if(angle < 0){
                this.addForce(3800);
                otherCollider.node.children[0].getComponent(sp.Skeleton).animation = 'ice_crack_brack';
                otherCollider.node.getComponent(cc.Sprite).spriteFrame = null;
                otherCollider.node.type = -1;
            }else{
                contact.disabled = true;
            }                
            break;
            case 60://黑洞
            otherCollider.node.active = false;            
            this.replaceScenes(1);
            break;                                   
        }                           
    },

    //吃星星
    addFood(num,node,bool){
        this.food += num;
        this.setScore2(10);
        this.canvas.getChildByName('score').getChildByName("score").getComponent(cc.Label).string = this.score.toString();        
        this.numMove(this.score.toString());
        this.canvas.getChildByName('score').getChildByName("food").getComponent(cc.Label).string = this.food.toString();       
        bool ? this.addForce(5500):this.addForce(4800);        
        this.spawnParticle(node.position);
        node.active = false;        
    },

    //数字滚动效果   
    numMove:function(data){ 
        var len = data.length;
        var childrenCount = this.scoreInfo.childrenCount;
        if(len > childrenCount){
            for(var i = 0;i < len - childrenCount; i++){
                this.scoreInfo.addChild(cc.instantiate(this.numPrefab));
            }
        } 
        var children = this.scoreInfo.children;
        for(var i = 0; i < len; i++){ 
            this.nummoveAction(children[i], data[i] , i);
        } 
        this.saveNum = data;
    },
    nummoveAction:function(node, num , pos){ 
        if(this.saveNum && this.saveNum[pos] == num){ 
            return;
        }
        node.getChildByName("text").stopAllActions();
        var action1 = cc.moveTo(0.1, cc.v2(0 , - parseInt(num) * 90)); 
        node.getChildByName("text").runAction(action1);  
    },

    //给人物一个向上的力
    addForce(force){    
        if(ach_data.platform>=500){
            this.queryAchList(4);
            if(ach_data.platform>=1000){
                this.queryAchList(9);
            }
        }
        ach_data.platform++;                   
        if(this.rocket >= 4 && this.state != 1){
            this.rigidBody.linearVelocity = cc.v2(this.rigidBody.linearVelocity.x,0);            
            var point = this.rigidBody.getWorldCenter();            
            this.rigidBody.applyLinearImpulse(cc.v2(0,force),point,true);            
        }
    },

    //碰到不同奖励逻辑
    getItem(i,node){
        this.addForce(3800);        
        this.playAnim(i);
        node.active = false;
        this.spawnParticle(node.position);                      
    },

    //人物盾破裂
    breakShield(){
        var spine = this.node.getChildByName('shield').getComponent(sp.Skeleton);
        spine.loop = false;
        spine.animation = 'protect_break';
    },

    //眩晕
    vertigo(){
        this.state = 1;
        if(this.rocket < 4)
            this.rocket = 3.9;
        var shield = this.node.getChildByName('shield').getComponent(sp.Skeleton);        
        shield.animation = 'vertigo';        
        cc.audioEngine.playEffect(this.audios[3],false);
    },

    //投弹
    projectile(i){        
        if(this.pjtPool.size() > 0 && this.boss.activeInHierarchy){
            var pjt = this.pjtPool.get();
            pjt.type = 20;
            pjt.bullet = i;
            pjt.position = this.node.position;
            pjt.parent = this.pjt;
            var spine = pjt.children[0].getComponent(sp.Skeleton);
            spine.loop = true;
            spine.animation = this.bullet[i];            
            var v2 = cc.pSub(this.boss.position,pjt.position);
            v2 = cc.pNormalize(v2);           
            var rig = pjt.getComponent(cc.RigidBody);
            rig.linearVelocity = v2.mul(800);            
        }
    },

    //无敌
    whosYourDaddy(){
        if(this.state == 1)             
        this.node.getChildByName('shield').getComponent(sp.Skeleton).animation = null;        
        if(this.state != 2){
            var action = cc.repeatForever(
                cc.sequence(cc.tintTo(0.3, 255, 0, 0),cc.tintTo(0.3, 255,255, 0),cc.tintTo(0.3,0,255, 0))
            );
            this.node.getChildByName('body').runAction(action);
        }            
        this.state = 2;
        this.rocket = 0;
    },
    
    //相机移动
    cameraFollow(){        
        if(this.node.y > this.camera.y){            
            this.camera.y = this.node.y;
            this.wall[0].y = this.camera.y;
            this.wall[1].y = this.camera.y;                       
            var range = Math.floor(this.node.y/120);                                            
            if(range > 0 && range >  this.rag){                                                    
                this.rag = range;
                this.createMap(range);              
                this.destroyMap(range);
                this.setScore();                               
            }            
        }else if(this.node.y < this.camera.y-cc.winSize.height*0.5+150){
            this.camera.y = this.node.y+(cc.winSize.height*0.5-150);
            this.wall[0].y = this.camera.y;
            this.wall[1].y = this.camera.y;            
            var dis = this.rag*120 - this.node.y;            
            if(dis > cc.winSize.height * 0.5){
                if(this.lv < 1 || this.scene == 1){
                    this.addForce(8000);                                                
                }else{
                    this.node.active = false;
                    this.hp > 0 ? this.selectRevive():this.gameOver();                                        
                    this.boss.getComponent('bigFish').playAnim(7,false);
                }                
            }          
        }
        this.moveBackGround(this.camera.y);
    },

    //创造地图
    createMap(range){
        if(range % 10 < 1){
            if(range / 10 % 2 == 0 && this.scene == 0){                
                this.spawnPlatformMatrix(range+10);
                if(this.lv > 2)
                this.spawnSplinter(range + 10);               
                if(this.node.y - this.npc.y > (cc.winSize.height + this.npc.height) * 0.5 && this.lv > 1 && Math.random() > 0.5){                   
                    this.npc.active = true;
                    var newPos = cc.v2(this.npc.x,(Math.ceil(Math.random() * 10) + range + 10) * 120 + 17 + this.npc.height * 0.5);
                    this.npc.setPosition(newPos);
                    this.canvas.getChildByName('warning').active = true;
                }                                 
            }else{
                this.spawnFoodMatrix(range+10);
            }         
        }
    },
    
    //销毁地图
    destroyMap(range){    
        var j = range - Math.ceil(cc.winSize.height*0.5/120);                    
        if(j > 0){
            if(cc.isValid(this.ground)){
                this.ground.destroy();
            }
            if(this.platList[j]){
                this.platList[j].stopAllActions();                                     
                this.platformPool.put(this.platList[j]);
                this.platList[j] = null;                                                                     
            }
            if(this.foodList[j]){
                for(var i = 0;i<this.foodList[j].length;i++){                                       
                    this.foodPool.size() < 40 ? this.foodPool.put(this.foodList[j][i]):this.foodList[j][i].destroy();                                                                                         
                }
                this.foodList[j] = null;
            }
            for(var b = 0;b < this.spt.children.length; b++){
                if(this.node.y - this.spt.children[b].y > (cc.winSize.height + this.spt.children[b].width) * 0.5){
                    this.splinterPool.put(this.spt.children[b]);                
                }
            }
        }
    },


    setScore(){
        this.setScore2(12);
        this.canvas.getChildByName('score').children[2].getComponent(cc.Label).string = this.score.toString();      
        this.numMove(this.score.toString());  
        var range = 0;
        if(this.score >= 1000){
            var notice = this.canvas.getChildByName('notice2');
            if(cc.isValid(notice)){
                notice.destroy();
                this.canvas.getChildByName('notice3').destroy();
                this.boss.active = true;
            }            
        }
        if(this.score >= 2000 && this.score < 5000)
            range = 1;
        if(this.score >= 5000 && this.score < 9000)
            range = 2;
        if(this.score >= 9000 && this.score < 14000)
            range = 3;        
        if(this.score >= 14000)
            range = 4;
        if(this.score >= 15000 ){
            var ef = this.node.getChildByName('effect');
            if(cc.isValid(ef)){
                this.node.getChildByName('effect').destroy();                
            } 
        }   
        if(range > 0 && range < 5 && this.lv != range){
            this.lv = range;
            this.boss.getComponent('bigFish').lv = range;
            if(range < 3){ 
                var spine = this.node.getChildByName('body').getComponent(sp.Skeleton);
                var spine2 = this.node.getChildByName('effect').getComponent(sp.Skeleton);
                spine.animation = skins[this.playerInfo.skin][this.lv];
                if(lx.language=="en"){
                    spine2.animation = 'level_up_E';           
                }
                else{
                    spine2.animation = 'level_up';           
                }              
            }else{
                var spine2 = this.node.getChildByName('effect').getComponent(sp.Skeleton);
                if(lx.language=="en"){
                    spine2.animation = 'level_hard_E';
                }
                else{
                    spine2.animation = 'level_hard';
                }
            }                                    
        }
            this.exceedRobot("next");       
                  
    },

    setScore2(num){
        var k = Math.ceil(this.node.y * 0.1 / 4000);
        if(k > 16){
            k = 16;
        }
        this.score += Math.ceil(num * (1 + k * 0.1));
        var bigFish = this.boss.getComponent('bigFish');
        bigFish.score = this.score;
        ach_data.score=this.score;
        if(ach_data.score>=5000){
            this.queryAchList(3);
            if(ach_data.score>=15000){
                this.queryAchList(8);
            }
        }
    },

    //产生台阶
    spawnPlatform(pos){        
        var platform = null;                         
        this.platformPool.size() > 0?platform = this.platformPool.get():platform = cc.instantiate(this.prefab[0]);
        platform.active = true;       
        platform.setPosition(pos);
        platform.type = 50;
        this.scene2 % 2 == 0 ? platform.getComponent(cc.Sprite).spriteFrame = this.branch[0] : platform.getComponent(cc.Sprite).spriteFrame = this.branch[2];
         
        var r = Math.floor(Math.random()*100);
        if(r < 5 + this.lv*1){
            platform.type = 51;
            platform.getComponent(cc.Sprite).spriteFrame = this.branch[1];            
        }
        if(r >= 5 + this.lv*1 && r <10 + this.lv*2){
            Math.floor(pos.x/320)>0?platform.setPosition(cc.v2(320+platform.width*0.5,pos.y)):            
            platform.setPosition(cc.v2(platform.width*0.5,pos.y));            
            var length = cc.winSize.width*0.5-platform.width;
            var action = cc.repeatForever(cc.sequence(                
                cc.moveBy(2, length, 0),                
                cc.moveBy(2, length*-1, 0)
            ));
            var time = Math.random();
            this.scheduleOnce(function(){platform.runAction(action);},time);            
        }                  
        platform.parent = this.platforms;
        var j = Math.floor(platform.y/120);            
        this.platList[j] = platform;              
    },

    //产生台阶矩阵
    spawnPlatformMatrix(y){
        for(var i = 0; i <10;i++){
            var vec = cc.v2(Math.ceil(Math.random()*470)+85,(y+i+1)*120);            
            this.spawnPlatform(vec);
            Math.floor(vec.x/320)>0? vec.x = 135.5:vec.x = 523.5;
            var r = Math.floor(Math.random()*100);
            if(r < 10 + this.lv * 2.5){
                var g = vec.x;
                var count  = Math.floor(Math.random()*3);
                for(var k = -1;k < count;k++){                            
                    vec.x = g+k*64;
                    this.spawnFood(vec,0);                           
                }
            }            
            if(r >= 10 + this.lv * 2.5 && r < 20 + this.lv * 5 ){
                if(Math.random() > 0.5){
                    this.spawnFood(vec,Math.ceil(Math.random()*5));
                }else{
                    if(this.boss.activeInHierarchy){
                        this.spawnFood(vec,Math.ceil(Math.random()*3) + 5);
                    }
                }                
            }                            
        }                     
    },

    //生产星星
    spawnFood(pos,type){
        let food = null;
        this.foodPool.size() > 0? food = this.foodPool.get():food = cc.instantiate(this.prefab[1]);
        food.active = true;        
        var rigidBody = food.getComponent(cc.RigidBody);
        rigidBody.linearVelocity = cc.v2();
        food.setPosition(cc.v2(pos.x,pos.y));
        food.parent = this.foods;        
        food.type = type;
        food.getComponent(cc.Sprite).spriteFrame = this.itemTex[type];
        var i = Math.floor(pos.y/120);
        this.foodList[i]?this.foodList[i].push(food):this.foodList[i] = new Array(food);
    },

    //随机生成星星矩阵
    spawnFoodMatrix(y){
        var j = Math.floor(Math.random()*this.matrixs.length);        
        for(var i = 0;i<this.matrixs[j].length;i++){
            var vec = cc.v2(this.matrixs[j][i].x,this.matrixs[j][i].y);
            vec.addSelf(cc.v2(0,y*120));
            var r = Math.floor(Math.random()*2);
            this.scene == 1 ? Math.random() < 0.9 ? this.spawnFood(vec,this.matrixs[j][i].type):this.spawnFood(vec,2 + r):
            this.spawnFood(vec,this.matrixs[j][i].type);
        }       
    },

    //产生星星粒子
    spawnParticle(pos){
        if(this.ptcPool.size() > 0){
            var particle = this.ptcPool.get();
            particle.setPosition(pos);
            particle.parent = this.particles;
            var system = particle.getComponent(cc.ParticleSystem);
            system.resetSystem();
            system.scheduleOnce(function(){
                this.ptcPool.put(particle);
            }.bind(this),1);
        }                 
    },
    //产生地刺
    spawnSplinter(y){
        if(this.splinterPool.size() > 0){
            var spt = this.splinterPool.get();            
            if(Math.random() > 0.5){
                var newPos = cc.v2(22,(Math.ceil(Math.random()*10)+y)*120);
                spt.scaleY = 1;
            }else{
                var newPos = cc.v2(640-22,(Math.ceil(Math.random()*10)+y)*120);
                spt.scaleY = -1;
            }
            spt.active = true;            
            spt.setPosition(newPos);
            spt.parent = this.spt;
            spt.type = 32;            
            var range = 2;
            if(this.score >= 9000 && this.score < 14000)
            var range = 3;
            if(this.score >= 14000)
            var range = 4;
            spt.width = (2 * range)*48;
            var collider = spt.getComponent(cc.PhysicsBoxCollider);
            collider.size = cc.size(spt.width,spt.height);
            collider.apply();            
        }
    },    
   //警告
    warring(){
        var warning = this.canvas.getChildByName('warning');
        if(warning.activeInHierarchy){
            warning.x = this.npc.x-cc.winSize.width*0.5;
            var length = this.npc.height*0.5 + cc.winSize.height*0.5;
            var dis = this.npc.y-this.node.y;
            if(dis <= length)
                warning.active = false;            
        }        
    },
    
    selectRevive(){
        cc.audioEngine.pauseMusic();      
        var panel = this.canvas.getChildByName('revive');
        panel.getChildByName('label').getComponent(cc.Label).string = this.playerInfo.revive.toString();
        panel.active = true;
    },
    //产生星星矩阵
    createMatrix(){
        var matrix = new Array();
        for(var i = 0; i <10;i++){
            for (var j = 0;j<3;j++){                              
                var subPos = this.createSubPos((j+1)*160,(i+1)*120,0);
                matrix.push(subPos);
            }
        }
        var matrix2 = new Array();        
        for(i = 0;i < 10;i++){
            var type = 0;
            if(i == 9)
                type = 1;
            subPos = this.createSubPos(320,(i+1)*120,type);
            matrix2.push(subPos);
        }
        var matrix3 = new Array();
        for(i = 0;i < 10;i++){
            for(j = 0;j<2;j++){
                type = 0;
                if(i == 9)
                    type = 1;                
                j>0?subPos = this.createSubPos(560,(i+1)*120,type):subPos = this.createSubPos(80,(i+1)*120,type);
                matrix3.push(subPos);
            }
        }
        var matrix4 = new Array();
        for(var a = 0;a < 2;a++){
            for(i = 0;i < 4;i++){
                for(j = 1+i;j<8-i;j++){            
                    type = 0;
                    if(i == 3)
                        type = 1;
                    subPos = this.createSubPos(j*80,(i+1+a*5)*120,type);
                    matrix4.push(subPos);
                }                    
            }
        }
        var matrix5 = new Array();
        for(i = 0;i<10;i++){
            type = 0;
            if(i == 4||i==9)
                type = 1;
            i>4?subPos = this.createSubPos(120,(i+1)*120,type):subPos = this.createSubPos(480,(i+1)*120,type);            
            matrix5.push(subPos);
        }
        var matrix6 = new Array();
        for(a = 0;a < 2;a++){
            for(i = 0;i < 4;i++){
                for(j = 1;j < 4;j++){
                    type = 0;
                    if(i == 3)
                        type =1;
                    subPos = this.createSubPos((j+a*4)*80,(i+1+a*5)*120,type);
                    matrix6.push(subPos);
                }
            }
        }
        this.matrixs.push(matrix);
        this.matrixs.push(matrix2);
        this.matrixs.push(matrix3);
        this.matrixs.push(matrix4);
        this.matrixs.push(matrix5);
        this.matrixs.push(matrix6);        
    },    

    //创建坐标对象
    createSubPos(x,y,type){
        var obj = {
            x:x,
            y:y,
            type:type,
        }
        return obj;
    },
    
    //场景切换
    onChangeScenes(event,scenes){
        isanno=true;
        cc.director.resume();
        cc.audioEngine.resumeMusic();
        if(typeof(sharedCanvas) == 'undefined'){
            lx.hideCustomView && lx.hideCustomView();
        }   
        if(scenes == "start" && this.playerInfo.tryState == 1){
            console.log(scenes)
            this.playerInfo.skin = 0;
            this.playerInfo.skinLocks[this.playerInfo.skin] = 2;
            this.playerInfo.tryState = 0;
        }     
        var playerInfo = JSON.stringify(this.playerInfo);
        localStorage.setItem('playerInfo5',playerInfo);                          
        cc.director.loadScene(scenes);

        var bannerAd=this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }
    },

    onClickShare(){        
        if(this.score <= 500)
            var url = 'https://h5.lexun.com/games/wx/avatar/jm0.png';       
        if(this.score > 500 && this.score < 1000)
            var url = 'https://h5.lexun.com/games/wx/avatar/jm1.png';
        if(this.score > 1000 && this.score < 5000)
            var url = 'https://h5.lexun.com/games/wx/avatar/jm2.png';
        if(this.score > 5000)
            var url = 'https://h5.lexun.com/games/wx/avatar/jm4.png';
        lx.sharelx.shareAppMessage({
            title: lx.i18n.t("label_text.share_1")+this.score.toString()+lx.i18n.t("label_text.share_2"),
            imageUrl:url,
            success:function(){
                                                        
            }.bind(this),                                         
        });
        this.scheduleOnce(function(){
            this.playerInfo.revive ++;                               
            if(this.lock){                    
                this.lock = false;
                this.playerInfo.share ++;
                if(this.playerInfo.share == 1)                    
                this.queue(3);
                if(this.playerInfo.share == 5)                    
                this.queue(4);
                if(this.playerInfo.share == 10)                    
                this.queue(5);
            }  
        }.bind(this),2);
       
    },    

    shareButton(event,i){
        var query = ''        
        if( i == 0){            
            var share = {
                type: 1,
                nickName:this.playerInfo.nickName,            
            }        
            var json = JSON.stringify(share);        
            query = 'data=' + json;
        }                       
        lx.shareAppMessage({
            title: this.shareText[i].str,
            imageUrl: this.shareText[i].url,
            query: query,
            success: function(){                
                
            }.bind(this),
        });  
        this.scheduleOnce(function(){
            this.playerInfo.revive ++;
               
            if(this.lock){                    
            this.lock = false;
            this.playerInfo.share ++;
            if(this.playerInfo.share == 1)
            this.queue(3);
            if(this.playerInfo.share == 5)
            this.queue(4);
            if(this.playerInfo.share == 10)
            this.queue(5);
            }       
        }.bind(this),2);
    
    },

    onClickRank(){
        if(typeof(sharedCanvas) == 'undefined'){
            var subCanvas = this.canvas.getChildByName('subCanvas');
            subCanvas.getComponent('subCanvas').replaceRank(true);
        }else{
            wx.postMessage({
                type:'2',                        
            });
        }
        this.canvas.getChildByName('gameOver').active = false;
        this.canvas.getChildByName('back').active = true;
    },

    onClickBack(){
        this.canvas.getChildByName('prize').active=false;        
        if(typeof(sharedCanvas) == 'undefined'){
            var subCanvas = this.canvas.getChildByName('subCanvas');
            subCanvas.getComponent('subCanvas').replaceRank(false);
        }else{
            wx.postMessage({
                type:'1',                        
            });
        }
        var skinPanel = this.canvas.getChildByName('skinPanel');
        if(this.currPanel == skinPanel){
            var content = skinPanel.getChildByName('view').children[0];
            while(content.children.length > 0){
                content.children[0].destroy();
                content.children[0].removeFromParent();                             
            }
            this.canvas.getChildByName('skinPanel').active=false;
        }
        this.canvas.getChildByName('subCanvas').active = true;
        this.canvas.getChildByName('gameOver').active = true;
        this.canvas.getChildByName('back').active = false;
 
        
        //banner广告
        var bannerAd=this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }

    },

    skinButton(){             
        this.canvas.getChildByName('gameOver').active = false;
        this.canvas.getChildByName('back').active = true;
        this.canvas.getChildByName('subCanvas').active = false;
        var skinPanel = this.canvas.getChildByName('skinPanel');
        skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
        skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
        for(var i = 0;i < this.playerInfo.skinLocks.length;i++){
            var node = cc.instantiate(this.prefab[5]);
            node.parent = skinPanel.children[4].children[0];
            var sprite = node.getChildByName('tex').getComponent(cc.Sprite);
            var sprite2 = node.getChildByName('button').getComponent(cc.Sprite);
            var stat = this.playerInfo.skinLocks[i];
            if(lx.language=="en"){
                if(stat!=0){
                    stat+=2;
                }
            }
            var icon = 'skin/' + (i + 1);
            var icon2 = 'button/' + stat;
            this.setSpriteFrame(icon,sprite);
            this.setSpriteFrame(icon2,sprite2);
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "player";
            clickEventHandler.handler = 'selectSkin';
            clickEventHandler.customEventData = i;
            var button = node.getChildByName('button').getComponent(cc.Button);
            button.clickEvents.push(clickEventHandler);        
            node.getChildByName("try").active = false;       
            //底座渲染
            this.setSkinSeat(node,this.skinType[i]);     
            if(stat){                
                node.getChildByName('label').active = false;
                node.getChildByName('start').active = false;
                node.getChildByName('diamond').active = false;
            }else{
                node.getChildByName('label').getComponent(cc.Label).string = this.skinPrice[i];                
                switch(this.skinType[i]){
                    case 0:
                    node.getChildByName('start').active = true;
                    node.getChildByName('diamond').active = false;
                    break;
                    case 1:
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = true; 
                    break
                    case 2:
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    break
                }
            }           
        }
        skinPanel.active = true;
        this.tryFlag = true; // 免费试穿标识
        this.tryButton.spriteFrame = this.trySprite[0];
        this.currPanel = skinPanel;

        //banner广告
        var bannerAd=this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }
    },

    //设置底座
    setSkinSeat:function(node,skinType){
        switch(skinType){
            case 0: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[0]; 
            break;
            case 1: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[1]; 
            break;
            case 2: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[2]; 
            break;
        }
    },

    setSpriteFrame:function(icon,sprite){
        cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },

    selectSkin(event,i){
        var skinPanel = this.canvas.getChildByName('skinPanel');      
        var content = skinPanel.children[4].children[0];
        var sprite = content.children[this.playerInfo.skin].getChildByName('button').getComponent(cc.Sprite);
        var sprite2 = content.children[i].getChildByName('button').getComponent(cc.Sprite);
        var node = content.children[i];
        if(this.playerInfo.skinLocks[i]){
            console.log("更换装备"); 
            if(lx.language=="en"){
                this.playerInfo.tryState == 0 && (this.setSpriteFrame('button/3',sprite)); //使用
                this.setSpriteFrame('button/4',sprite2); //已装备
            }else{
                this.playerInfo.tryState == 0 && (this.setSpriteFrame('button/1',sprite));
                this.setSpriteFrame('button/2',sprite2);
            }  
            this.playerInfo.tryState == 0 && (this.playerInfo.skinLocks[this.playerInfo.skin] = 1); 
            for(var j = 0; j < this.playerInfo.skinLocks.length;j++){
                if(this.playerInfo.skinLocks[j] == 2 ){
                    console.log("进来变2")
                    if(lx.language=="en"){
                        this.setSpriteFrame('button/3',content.children[j].getChildByName('button').getComponent(cc.Sprite)); //使用  
                    }else{
                        this.setSpriteFrame('button/1',content.children[j].getChildByName('button').getComponent(cc.Sprite));  
                    }  
                    this.playerInfo.skinLocks[j] = 1;
                }
            } 
            this.playerInfo.skinLocks[i] = 2;
            this.playerInfo.skin = i;
            this.iCount = i;  
            if(this.playerInfo.tryState == 1){
                this.tryFlag = false;
                this.usertry()
            }
            this.playerInfo.tryState = 0;
        }else{            
            switch(this.skinType[i]){
                case 0:
                if(this.playerInfo.star >= this.skinPrice[i]){
                    this.playerInfo.star -= this.skinPrice[i];
                    this.setSpriteFrame('button/1',sprite2);
                    this.playerInfo.skinLocks[i] = 1;
                    this.iCount = i; 
                    this.getNewSkin(i); //弹出得到新皮肤弹窗 
                    node.getChildByName('label').active = false;
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
                    skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
                }
                break;
                case 1:
                if(this.playerInfo.diamond >= this.skinPrice[i]){
                    this.playerInfo.diamond -= this.skinPrice[i];
                    this.setSpriteFrame('button/1',sprite2);
                    this.playerInfo.skinLocks[i] = 1;
                    this.iCount = i; 
                    this.getNewSkin(i); //弹出得到新皮肤弹窗 
                    node.getChildByName('label').active = false;
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
                    skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
                }
                break;
                case 2:
                this.shareSkinFun(node,i,sprite2);//分享逻辑
            }
        }
    },
    
      //分享皮肤逻辑
      shareSkinFun:function(node,i,sprite2){
        var shareInfo=JSON.parse(localStorage.getItem('shareInfo'));
        if(i==3){//分享1次
            this.tip.getComponent(cc.Label).string="分享"+ shareInfo.share_1 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                lx.shareAppMessage({
                    title: this.shareText[0].str,
                    imageUrl: this.shareText[0].url,
                    success: function(){ 
                      
                    }.bind(this),
                });  
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    // node.getChildByName('label').getComponent(cc.Label).string="分享"+  shareInfo.share_2 +"次可获得该皮肤";
                    shareInfo.share_1--;               
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_1--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2);
            
            }.bind(this),1);
        }
        if(i==4){//分享5次
            this.tip.getComponent(cc.Label).string="分享"+  shareInfo.share_2 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                lx.shareAppMessage({
                    title: this.shareText[1].str,
                    imageUrl: this.shareText[1].url,
                    success: function(){ 
                       
                    }.bind(this),
                }); 
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    shareInfo.share_2--;      
                    node.getChildByName("")         
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_2--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2); 
            }.bind(this),1);
        }
        if(i==5){//分享10次
            this.tip.getComponent(cc.Label).string="分享"+ shareInfo.share_3 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                lx.shareAppMessage({
                    title: this.shareText[2].str,
                    imageUrl: this.shareText[2].url,
                    success: function(){ 
                       
                    }.bind(this),
                });  
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    shareInfo.share_3--;               
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_3--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2);
            }.bind(this),1);
        }
    },


    reviveButton(){
        if(this.playerInfo.revive > 0){
            this.playerInfo.revive --;
            this.revive();
        }else{
            this.setTooltip(lx.i18n.t("label_text.revive"));
        }  
        var bannerAd=this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }
    },

    revive(){
        this.hp --;
        this.canvas.getChildByName('revive').active = false;
        this.whosYourDaddy();
        this.node.active = true;
        var bigFish = this.boss.getComponent('bigFish');
        if(bigFish.state == 0)
            bigFish.play(0,true);
        cc.audioEngine.resumeMusic();

        var bannerAd=this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }

    },

    giveOutButton(){
        this.canvas.getChildByName('revive').active = false;
        var bannerAd=this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('revive').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }
        this.gameOver();
    },

    paused(){        
        this.canvas.getChildByName('score').active = false;        
        this.canvas.getChildByName('paused').active = true;
        cc.audioEngine.pauseMusic();              
        cc.director.pause();      
    },

    resume(){        
        cc.director.resume();
        this.canvas.getChildByName('score').active = true;        
        this.canvas.getChildByName('paused').active = false;
        cc.audioEngine.resumeMusic();
    },    


    displayAD(){
        if(!lx.config.adUnitId) return;

        this.vedioBn.getComponent(cc.Button).interactable=false;
        this.reviveBn.getComponent(cc.Button).interactable=false;

        var self = this;
        lx.showRewardedVideoAd({
            adUnitId: lx.config.adUnitId,
            success: function(res){
                res.isEnded ? self.hp > 0 ? self.revive() : self.displayPrize(true) : self.setTooltip(lx.i18n.t("label_text.adv_1"));                          
            },
            fail:function(err){
                self.setTooltip(lx.i18n.t("label_text.adv_2"));
             
            },
            complete:function(){
                self.vedioBn.getComponent(cc.Button).interactable=true;  
                self.reviveBn.getComponent(cc.Button).interactable=true;        
            }
        });
    },

    //设置奖励
    displayPrize(bool){        
        this.canvas.getChildByName('gameOver').active = false;        
        this.canvas.getChildByName('subCanvas').active = false;
        var node = this.canvas.getChildByName('prize');        
        node.scale = 0.3;        
        var star =  111 * (Math.ceil(Math.random() * 9));
        this.addStar(star);
        var diamond = Math.ceil(Math.random() * 89) + 10;
        this.playerInfo.diamond += diamond;
        node.getChildByName('star').getComponent(cc.Label).string = 'x' + star;
        node.getChildByName('diamond').getComponent(cc.Label).string = 'x' + diamond;
        var spine = node.getChildByName('spine').getComponent(sp.Skeleton); 
        bool ? spine.animation = 'new_coin' :  spine.animation = 'new_box';
        node.active = true;
        var action = cc.scaleTo(0.25,1);
        node.runAction(action);
        this.currPanel = node;
    },


    anginButton(event){        
        event.target.getComponent(cc.Button).interactable = false;
    },
    
    //进度条更新
    updateProgressBar(){
        if(!this.ultimate){            
            this.food2 += 1;           
            var pgbNode = this.canvas.getChildByName('score').getChildByName('progressBar');
            if(this.food2 >= this.mt){
                this.ultimate = true;                
                this.food2 -= this.mt;
                this.mt += 20;
                this.magnet = 0;
                this.playAnim(1);
                this.whosYourDaddy();
                this.node.getChildByName('fly').getComponent(sp.Skeleton).animation = 'fly';     
                pgbNode.children[0].getComponent(sp.Skeleton).loop = true;
                pgbNode.children[0].getComponent(sp.Skeleton).animation = 'energy_full';                
            }            
            var pgb = pgbNode.getComponent(cc.Sprite);
            pgb.fillRange = this.food2 / this.mt;
        }        
    },    

    setTooltip(str){        
        var node = this.canvas.getChildByName('label');
        if(!node.activeInHierarchy){
            node.active = true;              
            node.children[0].getComponent(cc.Label).string = str;
            var finished = cc.callFunc(function(){
                node.setPosition(-700,0);
                node.active = false;
            },this)            
            var action = cc.sequence(                
                cc.moveBy(0.3,cc.v2(700,0)),
                cc.delayTime(2),
                cc.moveBy(0.3,cc.v2(700,0)),
                finished                
            );
            node.runAction(action);
        }
    },

    queue(i){
        if(!this.playerInfo.skinLocks[i]){ 
            this.playerInfo.skinLocks[i] = 1;
            var index = this.order.push(i);
            if(index == 1)
            for(var j = 0; j < this.playerInfo.skinLocks.length;j++){
                if(this.playerInfo.skinLocks[j] == 2 ){ 
                    this.playerInfo.skinLocks[j] = 1;
                }
                if(this.playerInfo.tryskin[j] == 1 ){ 
                    this.playerInfo.tryskin[j] = 0;
                }
            } 
            this.getNewSkin(i);                    
        } 
    },

    //得到新皮肤界面
    getNewSkin(i){        
        var panel = this.canvas.getChildByName('getSkin');                   
        this.setSkeletonData(panel.children[2],"playerSpine/"+playerSpine[i],skins[i][2],null,1,true);  
        this.iCount = i;
        panel.active = true;        
        var finished = cc.callFunc(function(){ 
            panel.opacity = 255;            
            this.order.splice(0,1);
            if(this.order[0]){
                this.getNewSkin(this.order[0]);
            }                                              
        },this); 
        panel.runAction(finished);  
    },

    //立即使用皮肤
    useSkin:function(){
        this.playerInfo.tryState == 0 && (this.playerInfo.skinLocks[this.playerInfo.skin] = 1);
        this.playerInfo.tryState = 0;
        this.playerInfo.skinLocks[this.iCount] = 2;
        this.playerInfo.skin = this.iCount;
        var panel = this.canvas.getChildByName('getSkin');      
        panel.active = false;
        var playerInfo = JSON.stringify(this.playerInfo);
        localStorage.setItem('playerInfo5',playerInfo);
        var skinPanel = this.canvas.getChildByName('skinPanel');  
        var content = skinPanel.children[4].children[0];
        while(content.children.length > 0){
            content.children[0].destroy();
            content.children[0].removeFromParent();                             
        }
        this.skinButton();
    },

    //场景切换
    replaceScenes(num){
        cc.audioEngine.playEffect(this.audios[4],false);
        this.scene = num;
        this.canvas.getChildByName('interlude').getComponent(sp.Skeleton).animation = 'interlude_start';
        this.scheduleOnce(function(){
            if(this.scene == 0){
                this.scene2 ++;
                ach_data.checkpoint++;
                if(ach_data.checkpoint>=3){
                    this.queryAchList(2);
                    if(ach_data.checkpoint>=8){
                        this.queryAchList(7);
                    }
                }
                var bigFish = this.boss.getComponent('bigFish');
                bigFish.skin = this.scene2 % 4;   
                this.setSkeletonData(this.boss.getChildByName("body"),"boss/"+this.bossSpine[this.scene2%4],this.bossSpine[this.scene2%4],null,1,true);//boss资源替换                   
                this.scene2 % 2 == 0 ? this.replaceBG('bg01') : this.replaceBG('bg03');                               
                bigFish.state = 0;
                bigFish.maxHp += 20;               
                bigFish.hp = bigFish.maxHp;
                this.boss.active = true;
                bigFish.play(0,true);
            }else{
                //这里开始切换场景(奖励关卡)
                if(lx.createBannerAd){
                    this.creatrBanner();
                }
                this.replaceBG('bg02');
                this.boss.active = false;
                this.time = 0;
                this.canvas.getChildByName('time').color = new cc.Color(255,255,255);
            }
            this.scheduleOnce(function(){
                this.canvas.getChildByName('interlude').getComponent(sp.Skeleton).animation = 'interlude_end';
            },0.4);                      
        },0.6);
        for(var i = 0; i < this.platforms.children.length; i++){
            this.platforms.children[i].getComponent(cc.Sprite).spriteFrame = null;
            this.platforms.children[i].active = false;            
        }
        for(var j = 0; j < this.foods.children.length; j++){
            this.foods.children[j].active = false;
        }
        for(var g = 0; g < this.spt.children.length; g++){
            this.spt.children[g].active = false;
        }
        this.rocket = 0;
        this.playAnim(0);      
    },

    //替换背景
    replaceBG(str){
        for(var i = 0; i < this.backGround.children.length; i++){
            var sprite = this.backGround.children[i].getComponent(cc.Sprite);
            var icon = str + '/' + i.toString();
            this.getSprite(icon,sprite);
        }        
    },

    //读取本地图片
    getSprite:function(icon,sprite){
        cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },

    //切换本地骨骼动画
    setSkeletonData(node,url,anim,callBack,timeScale,loop){//设置spine动画
        cc.loader.loadRes(url,sp.SkeletonData,function(err,sk){
            if(!err){
                if(node.getComponent(sp.Skeleton).skeletonData != sk){
                    //释放以前的骨骼资源
                    var deps = cc.loader.getDependsRecursively(node.getComponent(sp.Skeleton).skeletonData);
                    cc.loader.release(deps);
                    //替换骨骼资源
                    node.getComponent(sp.Skeleton).skeletonData = sk;
                }           
                if(anim){
                    node.getComponent(sp.Skeleton).animation = anim;//播放动画
                }
                node.getComponent(sp.Skeleton).loop = loop; 
                callBack && callBack();
                if(timeScale){
                    node.getComponent(sp.Skeleton).timeScale = timeScale;             
                }   
            }            
        });
    },

    //结算页面的星星
    addStar(num){
        this.playerInfo.star += num;
        var gameOver = this.canvas.getChildByName('gameOver');
        gameOver.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star.toString();
    },

    //游戏结束逻辑
    gameOver(){
        this.scoreInfo.removeAllChildren();
        this.hp = 0;
        if(this.playerInfo.tryState == 1){
            this.playerInfo.skin = 0;
            this.playerInfo.skinLocks[this.playerInfo.skin] = 2;
            this.playerInfo.tryState = 0;
        }
        this.canvas.getChildByName('mask').active = true;        
        var subCanvas = this.canvas.getChildByName('subCanvas');
        subCanvas.active = true;
        var gameOver = this.canvas.getChildByName('gameOver');
        gameOver.active = true;        
        gameOver.getChildByName('score').getComponent(cc.Label).string = this.score + '分';
        this.addStar(this.food);       
        gameOver.getChildByName('star2').children[0].getComponent(cc.Label).string = '+' + this.food;
        var action = cc.repeatForever(cc.rotateBy(10,360));
        gameOver.getChildByName('light').runAction(action);

        if(typeof(sharedCanvas) == 'undefined'){
            lx.showCustomView && lx.showCustomView({
                code : "game_over", 
                data : {score : this.score, title: "测试加团分"}, 
            });           
            gameOver.getChildByName('share').active = false;
            subCanvas.getComponent('subCanvas').replaceRank(false);
            lx.getUserCloudStorage({
                key:'userScore',
                success:function(data){
                    var maxScore = 0;                    
                    maxScore = data && data.value.game.score || -1;                                   
                    if(maxScore < this.score){                        
                        lx.setUserCloudStorage({
                            kvdata:{
                                key: "userScore", 
                                value: {
                                    game: {
                                        score: this.score,
                                        update_time: new Date().getTime()
                                    }
                                }
                            },                
                        });
                        subCanvas.getComponent('subCanvas').updateRank();
                    }
                }.bind(this),
            });
        }else{
            wx.postMessage({
                type:'0',
                message:this.score.toString(),            
            });
            if(Math.random() > 0.5)
            this.displayPrize(false);
        }
        if(this.score >3000)
            this.queue(1);
        if(this.score > 10000)
            this.queue(2);
        cc.audioEngine.playMusic(this.audios[1],false);
        this.foodPool.clear();
        this.platformPool.clear();        
        this.pjtPool.clear();
        this.ptcPool.clear();
    },  
    
    loadText(){
        this.skinPrice = [0,lx.i18n.t("label_text.skinText1"),lx.i18n.t("label_text.skinText2"),
        lx.i18n.t("label_text.skinText4"),lx.i18n.t("label_text.skinText5"),800,800,1800,1800,3800,3800,3800,9900,9900,680,680,1880,1880];
        this.skinType = [2,2,2,2,2,0,0,0,0,0,0,0,0,0,1,1,1,1];
        this.bossSpine=["001_bigfish","002_bigfish","003_bigfish","004_bigfish"];//boss名称
        this.itemsName = ['speed','magnet','protect'];
        this.bullet = ['bullet01','bullet_iron']; 
        this.shareText = [            
              
            {
                str:lx.i18n.t("label_text.shareText16"),
                url:'https://h5.lexun.com/games/wx/avatar/g17.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText17"),
                url:'https://h5.lexun.com/games/wx/avatar/g18.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText18"),
                url:'https://h5.lexun.com/games/wx/avatar/g19.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText19"),
                url:'https://h5.lexun.com/games/wx/avatar/g20.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText20"),
                url:'https://h5.lexun.com/games/wx/avatar/g21.jpg',
            }, 
        ];
    }, 

    //创造机器人
    loadRobot(){
        this.robot = [];
        this.createRobot('小猪配齐、少麻多辣','avatar/30',1590);
        this.createRobot('诚招**//公牛插座总**','avatar/29',2250);
        this.createRobot('非狗勿加','avatar/28',5590);
        this.createRobot('是假发不是桂桂啊','avatar/27',7450);
        this.createRobot('秋桂大大LL','avatar/26',9120);
        this.createRobot('Lonely|孤独前行','avatar/25',11300);
        this.createRobot('离岛','avatar/24',15600);
        this.createRobot('Posison.毒/','avatar/23',23300); 
        this.createRobot('gay里gay气西瓜酱','avatar/22',28650);
        this.createRobot('不为王臣亦为君','avatar/21',31060);
        this.createRobot('无关痛痒/无事生非','avatar/20',32910);
        this.createRobot('Love.Loser','avatar/19',36750);
        this.createRobot('李嘉图.路明非','avatar/18',39290);
        this.createRobot('C.CHENYI','avatar/17',38520);
        this.createRobot('极品游戏资源窝','avatar/16',46580);
        this.createRobot('百家兴阿杰','avatar/15',51470);
        this.createRobot('棒打叫花鸡','avatar/14',61550);
        this.createRobot('仟瑶','avatar/13',69130);
        this.createRobot('黑羽君','avatar/12',76210);
        this.createRobot('恋你如初','avatar/11',82250);
        this.createRobot('加班使我快乐','avatar/10',88780);
        this.createRobot('唐伯虎点蚊香','avatar/9',91350);
        this.createRobot('久病成良医','avatar/8',94990);
        this.createRobot('猫咪女禽兽','avatar/7',101960);
        this.createRobot('艾伦啊','avatar/6',102780);
        this.createRobot('草莓少女hetara~','avatar/5',111230);
        this.createRobot('寒风刮','avatar/4',127500);
        this.createRobot('回首阑珊三百首','avatar/3',128660);
        this.createRobot('走走停停。','avatar/2',130900);
        this.createRobot('花轮童鞋','avatar/1',157650);
            
    },

    createRobot(nick,icon,score){
        var robot = {
            nickname:nick,
            avatar:icon,
            score:score,
        };
        this.robot.push(robot);
    },

    exceedRobot(type){      
        if(type=="start"){
            var robot = this.canvas.getChildByName('score').getChildByName('robot');
            robot.getChildByName('nickname').getComponent(cc.Label).string = this.robot[0].nickname;
            robot.getChildByName('score').getComponent(cc.Label).string = this.robot[0].score + '分';
            var sprite = robot.getChildByName('avatar').getComponent(cc.Sprite);
            this.setSpriteFrame(this.robot[0].avatar,sprite);
        }
        if(type=="next"){
            if(this.score>this.robot[this.robatIndex].score){
                var robot = this.canvas.getChildByName('score').getChildByName('robot');
                var spine=robot.getChildByName("spine");
                spine.active=true;
                spine.getComponent(sp.Skeleton).animation="animation";//播放动画
                this.scheduleOnce(function(){
                    spine.active=false;
                }.bind(this),0.5);
                robot.getChildByName('nickname').getComponent(cc.Label).string = this.robot[this.robatIndex+1].nickname;
                robot.getChildByName('score').getComponent(cc.Label).string = this.robot[this.robatIndex+1].score + '分';
                var sprite = robot.getChildByName('avatar').getComponent(cc.Sprite);
                this.setSpriteFrame(this.robot[this.robatIndex+1].avatar,sprite);
                this.robatIndex++;

            }
        }
    
    },
    
    usertry:function(){
        var content = this.currPanel.children[4].children[0];
        if(this.tryFlag){
            this.tryFlag = false; 
            this.tryButton.spriteFrame = this.trySprite[1];
            
            for(var i=0; i < this.playerInfo.tryskin.length;i++){
                if(this.playerInfo.skinLocks[i] == 0){
                    content.children[i].getChildByName("try").active = true;
                    if(this.playerInfo.tryskin[i] == 0){
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[0];
                        var clickEventHandler = new cc.Component.EventHandler();
                        clickEventHandler.target = this.node;
                        clickEventHandler.component = "player";
                        clickEventHandler.handler = 'tryShare';
                        clickEventHandler.customEventData = i;
                        var button = content.children[i].getChildByName('try').getComponent(cc.Button);
                        button.clickEvents.push(clickEventHandler);
                    }else if(this.playerInfo.tryskin[i] == 2){
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[2];
                    }else{
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[1];
                    }
                }
            }
        }else{
            this.tryFlag = true; 
            this.tryButton.spriteFrame = this.trySprite[0];
            for(var i=0; i < this.playerInfo.tryskin.length;i++){
                content.children[i].getChildByName("try").active = false;
            }
        }
    },

    tryShare:function(event,pos){
        var i = Math.floor(Math.random() * this.shareText.length);
        var content = this.currPanel.children[4].children[0];
        var self = this; 
        //弹框
        this.tip.getComponent(cc.Label).string="分享后可获得该皮肤";
        this.tip.active=true;
        this.scheduleOnce(function(){
            this.tip.active=false;
            lx.shareAppMessage({
                title: this.shareText[i].str,
                imageUrl: this.shareText[i].url,
                success: function(res){
                }
            })
            this.scheduleOnce(function(){
                self.getTrySkin(pos);
                if(self.playerInfo.skinLocks[self.playerInfo.skin] != 0){
                    var sprite = content.children[self.playerInfo.skin].getChildByName('button').getComponent(cc.Sprite);  
                    if(lx.language=="en"){
                        self.setSpriteFrame('button/3',sprite);
                    }else{
                        self.setSpriteFrame('button/1',sprite);
                    }
               }
                if(self.playerInfo.tryskin[self.playerInfo.skin] !=2){
                    content.children[self.playerInfo.skin].getChildByName("try").getComponent(cc.Sprite).spriteFrame = self.trybuttonSprite[0]; 
                }
                content.children[pos].getChildByName("try").getComponent(cc.Sprite).spriteFrame = self.trybuttonSprite[1];
                console.log("试穿成功",pos);
                if(self.playerInfo.skinLocks[self.playerInfo.skin] == 2){
                    self.playerInfo.skinLocks[self.playerInfo.skin] = 1;
                    console.log("改变成1")
                }else{
                    self.playerInfo.skinLocks[self.playerInfo.skin] = 0;
                    console.log("改变成0")
                }
                self.playerInfo.tryState = 1; //试穿状态
                self.playerInfo.skin = pos;
            },2)
           
        }.bind(this),1);
    },
    shareApp:function(){
        var i = Math.floor(Math.random() * this.shareText.length);
        var self = this; 
        lx.shareAppMessage({
            title: self.shareText[i].str,
            imageUrl: self.shareText[i].url,
            success: function(res){

            }
        });
        this.scheduleOnce(function(){
            self.getskinPopup.active = false;
        },2);
    },
    jumpOut:function(){
        var panel = this.canvas.getChildByName('getSkin');     
        panel.active = false;
      
    },
    jumpTryOut:function(){
        var panel = this.canvas.getChildByName('getTrySkin');       
        panel.active = false;
    },
    getTrySkin(i){
        var panel = this.canvas.getChildByName('getTrySkin');           
        this.setSkeletonData(panel.children[2],"playerSpine/"+playerSpine[i],skins[i][2],null,1,true);  
        this.iCount = i;
        panel.active = true;        
        var finished = cc.callFunc(function(){
            panel.opacity = 255;            
            this.order.splice(0,1);
            if(this.order[0]){
                this.getNewSkin(this.order[0]);
            }                                              
        },this);
        panel.runAction(finished);    
    },

    //点击成就icon
    onClickAch:function(){
        cc.find("Canvas/achievement").active=true;
        //banner广告
        var bannerAd=this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd;
        if(bannerAd){
            this.canvas.getChildByName('gameOver').getComponent("spineControl").bannerAd.hide();//关闭banner广告
        }
    },

    //跳出成就页面
    onReturnAch:function(){
        // this.deleteAchItem();
        cc.find("Canvas/achievement").active=false;
        this.ach_box.removeAllChildren();
    },

    //遍历成就列表
    queryAchList:function(type){
        var achInfo=this.playerInfo.achievement;
        for(let i=0;i<achInfo.length;i++){
            if(achInfo[i][1]==type){
                this.playerInfo.achievement[i][0]="get";
            }
        }
    },

    //创造banner广告    
    creatrBanner:function(){
        var object={
            adUnitId:"adunit-e4255b8476385b41",
            style:{
                left: 0, //wx.getSystemInfoSync().windowWidth wx.getSystemInfoSync().windowHeight
                top: 0,
                width: wx.getSystemInfoSync().screenWidth,
            }
        }
        var bannerAd=lx.createBannerAd(object);
            bannerAd.onError(err => {
            console.log(err)
        })
            bannerAd.onResize(res => {
            bannerAd.style.top = wx.getSystemInfoSync().windowHeight -bannerAd.style.realHeight;
        })
        this.bannerAd=bannerAd;
        this.bannerAd.show();   
    }

});
   


cc.Class({
    extends: cc.Component,

    properties: {
        //预制体
        mosterPrefab:cc.Prefab,
        bossPrefab:cc.Prefab,
        squareMosterPrefab:cc.Prefab,
        roundMosterPrefab:cc.Prefab,
        splitMosterPrefab:cc.Prefab,
        moster_born_Prefab:cc.Prefab,
        checkpointAniPrefab:cc.Prefab,
        roleBorn_Prefab:cc.Prefab,
        roleFocus_Prefab:cc.Prefab,
        residual_Prefab:cc.Prefab,
        mosterBoomPrefab:cc.Prefab,
        moster_death:cc.Prefab,//三角死亡
        squaremoster_death:cc.Prefab,//方星死亡
        roundmoster_death:cc.Prefab,//圆形死亡
        splitmoster_death:cc.Prefab,//分裂死亡
        roleDeath_Prefab:cc.Prefab,

        role:cc.Node,
        camera:cc.Node,

        //容器
        mosterContainer:cc.Node,
        bulletContainer:cc.Node,
        awardContainer:cc.Node,
        deathContainer:cc.Node,//装所有与逻辑无关的元素


        //界面sprite
        checkpointView:cc.Node,
        checkpointDesc:cc.Node,
        bg:cc.Node,
        border:cc.Node,
        energyView:cc.Node,
        energySprite:[cc.SpriteFrame],
        Mask:cc.Node,
        progressBar:cc.Node,//进度框
        scoreView:cc.Node,//分数框
        scoreTip:cc.Node,
        tip:cc.Node,

        //怪兽sprite
        roundColor:[cc.SpriteFrame],//圆形怪
        squareColor:[cc.SpriteFrame],//方形怪
        triangleColor:[cc.SpriteFrame],//三角怪

        maxPosX:0,//屏幕最大宽度/2
        maxPosY:0,//屏幕最大高度/2
    },



    onLoad () {
        // cc.director.setDisplayStats(false);
        //初始化全局(游戏)变量
        this.oninitGlobal();
        /**
         * 照相机边界中间变量
         */
        this.camera_pos_left=0;
        this.camera_pos_right=0;
        this.camera_pos_top=0;
        this.camera_pos_down=0;
        

        //关卡动画
        this.checkpointAni();    
        //生成怪兽
        this.createLargeMos();
        //role出生动画
        this.roleBornAni();
        //分数渲染
        this.onRenderScore();
        //boss关卡残留物
        this.schedule(function(){
            if(bossPoint==true){
                this.onCreateResidual();
            }
        }.bind(this),1.5);
    },

    start:function(){
        //创建游戏node对象池
        this.onCreateNodePool();
    },

    //初始化游戏全局变量
    oninitGlobal:function(){
        isLive=true;//初始化生存开关
        energyNum=3;//初始化能量值
        killNum=0;//初始化击杀数
        checkpoint=1;//默认为第一关
        GenMoster=false;//怪兽生成开关
        score=0;//初始化分数
        bossPoint=false;

        //初始化武器状态
        skillType.direct=true;
        skillType.tracking=false;
        skillType.rebound=false;
        skillType.laser=false;
        skillType.bubble=false;

    },


    //创建对象池
    onCreateNodePool:function(){
        //怪兽出生对象池
        this.bornAniPool = new cc.NodePool();
        this.poolMerge(5,this.moster_born_Prefab,this.bornAniPool);
        //水花对象池
        this.boomPool = new cc.NodePool();
        this.poolMerge(10,this.mosterBoomPrefab,this.boomPool);
        //残留体对象池
        this.residualAniPool = new cc.NodePool();
        this.poolMerge(3,this.residual_Prefab,this.residualAniPool);

        //怪兽死亡动画对象池
        //三角形
        this.mosterPool = new cc.NodePool();
        this.poolMerge(8,this.moster_death,this.mosterPool);
        //正方形
        this.sqMosterPool = new cc.NodePool();
        this.poolMerge(8,this.squaremoster_death,this.sqMosterPool);
        //圆形
        this.rdMosterPool = new cc.NodePool();
        this.poolMerge(8,this.roundmoster_death,this.rdMosterPool);

        // //怪兽对象池
        // //三角形
        // this.trianglePool = new cc.NodePool();
        // this.poolMerge(8,this.mosterPrefab,this.trianglePool);
        // //正方形
        // this.squarePool = new cc.NodePool();
        // this.poolMerge(8,this.squareMosterPrefab,this.squarePool);
        // //圆形
        // this.roundPool = new cc.NodePool();
        // this.poolMerge(8,this.roundMosterPrefab,this.squarePool);
    },

    //创建对象池封装
    poolMerge:function(num,prefab,pool){
        for (let i = 0; i < num; i++) {
            let node = cc.instantiate(prefab); // 创建节点
            pool.put(node); // 通过 putInPool 接口放入对象池
        }
    },

    //游戏分数渲染
    onRenderScore:function(){
        this.schedule(function(){
            score+=10;
            this.scoreView.getComponent(cc.Label).string=score;
        }.bind(this),0.05);
    },

    //暴击分数渲染
    scoreAni:function(num){
        score+=num;
        this.scoreTip.active=true;
        this.scoreTip.getComponent(cc.Label).string="+ "+num;
        var moveup=cc.moveBy(1.5,cc.v2(0,200));
        var fade_out=cc.fadeOut(1.5,0);
        var call=cc.callFunc(function(){
            this.scoreTip.active=false;
            this.scoreTip.opacity=255;
            this.scoreTip.setPosition(cc.v2(0,0));
        }.bind(this));
        this.scoreTip.runAction(cc.sequence(cc.spawn(moveup,fade_out),call));
    },

    //关卡动画
    checkpointAni:function(){
        this.checkpointView.getChildByName("num").getComponent(cc.Label).string=checkpoint;
        var move_up=cc.moveTo(1,cc.v2(0,400)).easing(cc.easeCubicActionIn());
        var move_down=cc.moveTo(1,cc.v2(0,100)).easing(cc.easeCubicActionOut());
        var call=cc.callFunc(function(){
            this.scheduleOnce(function(){
                GenMoster=true;
            }.bind(this),4);
        }.bind(this));
        this.checkpointView.runAction(cc.sequence(move_down,call,move_up));

        this.checkpointDesc.getChildByName("num").getComponent(cc.Label).string=checkpoint;

    },

    //关卡骨骼动画
    checkpointSpineAni:function(){
         //关卡骨骼动画
         var checkpointAni=cc.instantiate(this.checkpointAniPrefab);
         checkpointAni.parent=this.deathContainer;
         checkpointAni.setPosition(cc.v2(0,0));
         this.scheduleOnce(function(){
            this.clearSpine(checkpointAni);
         }.bind(this),0.8);
    },

    //role出生动画
    roleBornAni:function(){
        cc.log("role出生动画")
        var roleBorn=cc.instantiate(this.roleBorn_Prefab);
        roleBorn.parent=this.deathContainer;
        roleBorn.setPosition(cc.v2(0,0));
        this.scheduleOnce(function(){
            this.clearSpine(roleBorn);
            this.role.opacity=255;
            this.Mask.active=false;
            this.checkpointSpineAni();
        }.bind(this),2.5);
      
    },

    //moster死亡动画
    onMosterDeath:function(moster){
        var moster_death=null;
        if(moster.name=="moster"){//三角
           var colortag=moster.getComponent("moster").colortag;
           if(colortag=="红"){
                moster_death=this.deathSimple(this.mosterPool,"triangle_R",this.moster_death);
           }
           if(colortag=="蓝"){
                moster_death=this.deathSimple(this.mosterPool,"triangle_B",this.moster_death);
           }
        }
        if(moster.name=="roundMoster"){//圆形
            var colortag=moster.getComponent("moster").colortag;
            if(colortag=="红"){
                moster_death=this.deathSimple(this.rdMosterPool,"octagon_R",this.roundmoster_death);
            }
            if(colortag=="蓝"){
                moster_death=this.deathSimple(this.rdMosterPool,"octagon_B",this.roundmoster_death);
            }
         }
         if(moster.name=="squareMoster"){//方形
            var colortag=moster.getComponent("moster").colortag;
            if(colortag=="红"){
                moster_death=this.deathSimple(this.sqMosterPool,"square_R",this.squaremoster_death);
            }
            if(colortag=="蓝"){
                moster_death=this.deathSimple(this.sqMosterPool,"square_B",this.squaremoster_death);
            }
         }
         if(moster.name=="splitMoster"){
            moster_death=cc.instantiate(this.splitmoster_death);
         }

        //随机角度
        var angel_ram=Math.floor(Math.random()*360);
        moster_death.rotation=angel_ram;
        moster_death.setPosition(moster.getPosition());
        this.scheduleOnce(function(){
            this.destoryFun(moster_death,1);
        }.bind(this),0.6);

        //渐隐消失动画
        var fadeAni=cc.fadeOut(0.5,0);
        var call=cc.callFunc(function(){
            this.scheduleOnce(function(){
                // this.destoryFun(moster,0);
                moster.destroy();
            }.bind(this),0.8);
        }.bind(this));
        moster.runAction(cc.sequence(fadeAni,call));

    },

    //回收到对象池
    destoryFun: function(node,type){
        node.removeFromParent();
        switch(node.name){
            case "moster":
                type==0?this.trianglePool.put(node):this.mosterPool.put(node)
                break;  
            case "squareMoster":
                type==0?this.squarePool.put(node):this.sqMosterPool.put(node)
                break;  
            case "roundMoster":
                type==0?this.roundPool.put(node):this.rdMosterPool.put(node)
                break;  
            default:
                node.destroy();
                break;
        }
    },

    //死亡封装
    deathSimple:function(pool,ani,prefab){
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        var moster_death=null;
        if (pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            moster_death = pool.get();
            moster_death.parent=deathCantainer;
            moster_death.getComponent(sp.Skeleton).setAnimation(0,ani,false);
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            moster_death=cc.instantiate(prefab);
            moster_death.parent=deathCantainer;
            moster_death.getComponent(sp.Skeleton).setAnimation(0,ani,false);
        }
        return moster_death;
    },

    //role聚焦于角色动画
    roleFocusAni:function(){
        var roleFocus=cc.instantiate(this.roleFocus_Prefab);
            roleFocus.parent=this.role;
            this.scheduleOnce(function(){
                this.clearSpine(roleFocus);
            }.bind(this),1);
    },

    //生成分裂小方形怪
    onCreateSmallSplit:function(splitMoster){
        var dis_Arr=[cc.v2(100,172),cc.v2(0,200),cc.v2(-172,100),cc.v2(-172,-100),cc.v2(0,-200),cc.v2(172,-100)];//配置扩散的距离(30,90,150,210,270,330)
        var mosterContainer=cc.find("Canvas/gameView/container/mosterContainer");
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        var splitMoster_pos=splitMoster.getPosition();
            for(var i=0;i<6;i++){
                var moveAction=null;
                var moster=cc.instantiate(this.mosterPrefab);
                var call=cc.callFunc(function(){
                    moster.parent=mosterContainer;
                }.bind(this));
                moster.parent=deathCantainer;
                moster.getComponent("moster").colortag="红";
                moster.setPosition(splitMoster_pos);
                switch(i){
                        case 0:
                            moster.rotation=180;
                            moveAction=cc.moveBy(0.6,dis_Arr[0]);
                        break;
                        case 1:
                            moster.rotation=240;
                            moveAction=cc.moveBy(0.6,dis_Arr[1]);
                        break;
                        case 2:
                            moster.rotation=300;
                            moveAction=cc.moveBy(0.6,dis_Arr[2]);
                        break;
                        case 3:
                            moster.rotation=0;
                            moveAction=cc.moveBy(0.6,dis_Arr[3]);
                        break;
                        case 4:
                            moster.rotation=60;
                            moveAction=cc.moveBy(0.6,dis_Arr[4]);
                        break;
                        case 5:
                            moster.rotation=120;
                            moveAction=cc.moveBy(0.6,dis_Arr[5]);
                        break;                                                                
                    }
                    moster.runAction(cc.sequence(moveAction,call));
            }
        },


    //生成残留体(boss关卡独有)
    onCreateResidual:function(){
        var num=this.onGetNumber();
        var residual_x=Math.floor(Math.random()*this.maxPosX)*num;
        var residual_y=Math.floor(Math.random()*this.maxPosY)*num;
        var distance=cc.pDistance(cc.v2(residual_x,residual_y),this.role.getPosition());
       
        if(distance>250){
            var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
            if (this.residualAniPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                var residual = this.residualAniPool.get();
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                var residual=cc.instantiate(this.residual_Prefab);
            }
            residual.parent=deathCantainer;
  
            residual.setPosition(cc.v2(residual_x,residual_y));
            residual.getComponent(sp.Skeleton).setAnimation(0,"foe_death02_buff",true);
            this.scheduleOnce(function(){
                this.residualAni(residual);
            }.bind(this),3);
        }
    
    },
    //role死亡动画
    roleDeathAni:function(role){
        var deathCantainer=cc.find("Canvas/gameView/container/deathCantainer");
        var roleDeath=cc.instantiate(this.roleDeath_Prefab);
        roleDeath.parent=deathCantainer;
        roleDeath.setPosition(role.getPosition());
        this.scheduleOnce(function(){
            this.clearSpine(roleDeath);
        }.bind(this),1);
    },

    //残留物动画
    residualAni:function(residual){
        residual.getComponent(sp.Skeleton).setAnimation(0,"foe_death02",false);
        this.scheduleOnce(function(){
            this.residualAniPool.put(residual);
        }.bind(this),1);
    },

    //怪兽水花
    onMosterBoom:function(moster){
        var colortag=moster.getComponent("moster").colortag;
        if(colortag=="红"){
            var mosterBoom=this.deathSimple(this.boomPool,"hit_R",this.mosterBoomPrefab);
        }
        else{
            var mosterBoom=this.deathSimple(this.boomPool,"hit_B",this.mosterBoomPrefab);
        }
        mosterBoom.setPosition(moster.getPosition());

        this.scheduleOnce(function(){
            this.boomPool.put(mosterBoom);
        }.bind(this),0.3);
    },

      //产生水花
      onBossBoom:function(boss){
        var colortag=boss.getComponent("boss").colortag;
        if(colortag=="红"){
            var mosterBoom=this.deathSimple(this.boomPool,"hit_R",this.mosterBoomPrefab);
        }
        else{
            var mosterBoom=this.deathSimple(this.boomPool,"hit_B",this.mosterBoomPrefab);
        }
        mosterBoom.setPosition(boss.getPosition());
        this.scheduleOnce(function(){
            this.boomPool.put(mosterBoom);
        }.bind(this),0.3);
    },

    //随机取1,-1
    onGetNumber:function(){
        //随机正负数组
        var arr=[1,-1];
        var num=Math.ceil(Math.random()*2)-1;
        var real_num=arr[num];
        return real_num;
    },  

    //怪兽量产器
    createLargeMos:function(){
        //生成普通怪物
        this.schedule(function(){    
            if(GenMoster==true){
                for(var i=0;i<8;i++){
                    if(this.mosterContainer.children.length<=5){//控制怪物个数
                        var num=Math.random();
                        if(num>0.5){
                            //生成方形怪
                            this.createMosInBorder("squareMoster");  
                        }
                        else{
                            //生成圆形怪
                            this.checkDistance("roundMoster");
                        }
                    }
                }
            }
        }.bind(this),1);

        //生成三角怪
        this.schedule(function(){    
            if(GenMoster==true){
                //生成三角怪
                this.createMosInBorder("moster");
            }
        }.bind(this),1);//3

        //生成分裂怪
        this.schedule(function(){    
            if(GenMoster==true){
                this.checkDistance("splitMoster");
            }
        }.bind(this),15);//8

    },


    //边界生成怪兽
    createMosInBorder:function(type){
        var num=this.onGetNumber();
        var moster_x=Math.floor(Math.random()*950)*num;
        var moster_y=Math.floor(Math.random()*600)*num;
        var arr_pos=[cc.v2(moster_x,600),cc.v2(moster_x,-600),cc.v2(950,moster_y),cc.v2(-950,moster_y)];
        var pos=arr_pos[Math.floor(Math.random()*4)];
        //怪兽生成动画
        if (this.bornAniPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            var moster_born = this.bornAniPool.get();
            moster_born.getComponent(sp.Skeleton).setAnimation(0,"foe_born",false);
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            var moster_born=cc.instantiate(this.moster_born_Prefab);
        }
        moster_born.parent=this.deathContainer;
        moster_born.setPosition(pos);
        this.scheduleOnce(function(){
            this.bornAniPool.put(moster_born);
        }.bind(this),0.8);

        if(type=="moster"){//三角怪
            // if (this.trianglePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            //     var moster = this.trianglePool.get();
            // } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            //     var moster=cc.instantiate(this.mosterPrefab);
            // }
            var moster=cc.instantiate(this.mosterPrefab);
            moster.parent=this.mosterContainer;
            this.mosterColorChange(moster,this.triangleColor);
            moster.setPosition(pos);
        }
        if(type=="squareMoster"){//方形怪
            // if (this.squarePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            //     var squareMoster = this.squarePool.get();
            // } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            //     var squareMoster=cc.instantiate(this.squareMosterPrefab);
            // }
            var squareMoster=cc.instantiate(this.squareMosterPrefab);
            squareMoster.parent=this.mosterContainer;
            this.mosterColorChange(squareMoster,this.squareColor);
            squareMoster.setPosition(pos);
        }
    
    },

    //检测怪兽(界面内生成怪兽)
    checkDistance:function(type){
        var num=this.onGetNumber();
        var moster_x=Math.floor(Math.random()*this.maxPosX)*num;
        var moster_y=Math.floor(Math.random()*this.maxPosY)*num;
        var distance=cc.pDistance(cc.v2(moster_x,moster_y),this.role.getPosition());
        if(distance>250){
            //怪兽生成动画
            if (this.bornAniPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                var moster_born = this.bornAniPool.get();
                moster_born.getComponent(sp.Skeleton).setAnimation(0,"foe_born",false);//对象状态需要重置
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                var moster_born=cc.instantiate(this.moster_born_Prefab);
            }
            moster_born.parent=this.deathContainer;
            moster_born.setPosition(cc.v2(moster_x,moster_y));
            this.scheduleOnce(function(){
                this.bornAniPool.put(moster_born);
            }.bind(this),0.8);


            if(type=="roundMoster"){//圆形怪
                // if (this.roundPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                //     var roundMoster = this.roundPool.get();
                // } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                //     var roundMoster=cc.instantiate(this.roundMosterPrefab);
                // }
                var roundMoster=cc.instantiate(this.roundMosterPrefab);
                roundMoster.parent=this.mosterContainer;
                this.mosterColorChange(roundMoster,this.roundColor);
                roundMoster.setPosition(cc.v2(moster_x,moster_y));

            }

            if(type=="splitMoster"){//分裂怪
                var splitMoster=cc.instantiate(this.splitMosterPrefab);
                splitMoster.parent=this.mosterContainer;
                splitMoster.setPosition(cc.v2(moster_x,moster_y));
            }
        }
        
    },

    //怪兽颜色替换
    mosterColorChange:function(moster,colorArr){
        var index=Math.floor(Math.random()*8);
        if(index<4){ //红色
            moster.getComponent("moster").colortag="红";
        }
        else{
            moster.getComponent("moster").colortag="蓝";
        }
        moster.getComponent(cc.Sprite).spriteFrame=colorArr[index];

    },

    //boss产生
    bossBorn:function(){
        bossPoint=true;
        //关闭量产怪兽
        GenMoster=false;
        //打开boss进度条
        this.progressBar.active=true;
        //tip提示
        this.tip.getComponent(cc.Label).string="boss来临!!!!"
        var move_up=cc.moveTo(1,cc.v2(0,770)).easing(cc.easeCubicActionIn());
        var move_down=cc.moveTo(1,cc.v2(0,100)).easing(cc.easeCubicActionOut());
        var call=cc.callFunc(function(){
            //boss生成
            var boss = cc.instantiate(this.bossPrefab);
            boss.parent=this.mosterContainer;
            if(checkpoint%2==1){
                boss.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_R",true);
            }
            else if(checkpoint%2==0){
                boss.getChildByName("ani").getComponent(sp.Skeleton).setAnimation(0,"boss_B",true);
            }
        }.bind(this));
        this.tip.runAction(cc.sequence(move_down,move_up,call));
    },

    //清除动画缓存
    clearSpine:function(node){
        var spine=node.getComponent(sp.Skeleton);
        var deps=cc.loader.getDependsRecursively(spine.skeletonData);
        // cc.loader.release(deps);
        node.destroy();
    },

    //停止移动照相机
    limitcamera:function(type){
        if(type=="right"){
            this.camera_pos_right==0?this.camera_pos_right=this.camera.x:this.camera.x=this.camera_pos_right;
        }
        if(type=="left"){
            this.camera_pos_left==0?this.camera_pos_left=this.camera.x:this.camera.x=this.camera_pos_left;
        }
        if(type=="top"){
            this.camera_pos_top==0?this.camera_pos_top=this.camera.y:this.camera.y=this.camera_pos_top;
        }
        if(type=="down"){
            this.camera_pos_down==0?this.camera_pos_down=this.camera.y:this.camera.y=this.camera_pos_down;
        }
    },

    //技能按钮背景切换
    onSwitchSkillBg:function(skillIndex){
        var skillBgArr=this.skillBg.children;
        for(var i=0;i<skillBgArr.length;i++){
            skillBgArr[i].active=false;
        }
        skillBgArr[skillIndex].active=true;
    },

    //背景换肤
    onSwitchSkin:function(){
        //背景图片换肤
        var sprite_bg = this.bg.getComponent(cc.Sprite);
        var url = cc.url.raw("resources/bg/bg_"+checkpoint%4+".png");
        this.loadRes(url,sprite_bg);

        //人物换肤 
        var sprite_role = this.role.getComponent(cc.Sprite);
        var url = cc.url.raw("resources/bg/role_"+checkpoint%4+".png");
        this.loadRes(url,sprite_role);

        //边框换肤
        var sprite_border = this.border.getComponent(cc.Sprite);
        var url = cc.url.raw("resources/bg/border_"+checkpoint%4+".png");
        this.loadRes(url,sprite_border);

        //能量条换肤
        var arr=this.energyView.children;
        if(checkpoint%4==1){
            for(var i=0;i<arr.length;i++){
                arr[i].getComponent(cc.Sprite).spriteFrame=this.energySprite[0];
            }
        }
        else if(checkpoint%4==2){
            for(var i=0;i<arr.length;i++){
                arr[i].getComponent(cc.Sprite).spriteFrame=this.energySprite[1];
            }
        }
        else if(checkpoint%4==3){
            for(var i=0;i<arr.length;i++){
                arr[i].getComponent(cc.Sprite).spriteFrame=this.energySprite[2];
            }
        }
        else if(checkpoint%4==0){
            for(var i=0;i<arr.length;i++){
                arr[i].getComponent(cc.Sprite).spriteFrame=this.energySprite[3];
            }
        }
        
    },

    //本地切换
    loadRes:function(url,spriteBg){
        cc.loader.load(url, function (err, texture) {
            spriteBg.spriteFrame = new cc.SpriteFrame(texture);
        });
    },
     
    //下一关的逻辑
    nextLevel:function(){
        //击杀数清零
        killNum=0;
        //关卡数+1
        checkpoint++;
        //清除所有怪兽
        var mosterArr=cc.find("Canvas/gameView/container/mosterContainer").children;
        for(var i=0;i<mosterArr.length;i++){
            mosterArr[i].destroy();
        }
        //拉出关卡界面
        if(isLive==true){
            this.checkpointAni();
            this.checkpointSpineAni();
            this.roleFocusAni();
            this.onSwitchSkin();
        }
    
    },


    //暂停游戏      
    stopGmae:function(){
        cc.find("Canvas/gameView/gameOperation/bg").active=true;
        cc.find("Canvas/gameView/gameOperation/stopBn").active=false;
        cc.find("Canvas/gameView/gameOperation/startBn").active=true;
        cc.director.pause();
    },

    //开始游戏 
    startGame:function(){
        cc.find("Canvas/gameView/gameOperation/bg").active=false;
        cc.find("Canvas/gameView/gameOperation/stopBn").active=true;
        cc.find("Canvas/gameView/gameOperation/startBn").active=false;
        cc.director.resume();
    },


});

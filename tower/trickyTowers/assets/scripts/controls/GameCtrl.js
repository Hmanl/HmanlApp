
cc.Class({
    extends: cc.Component,

    properties: {
        //-- 返回按钮
        backBtn : cc.Node,

        //-- 向左按钮
        leftBtn : cc.Node,

        //-- 向右按钮
        rightBtn : cc.Node,

        //-- 向下按钮
        downBtn : cc.Node,

        //-- 向上按钮（房子）
        upBtn : cc.Node,

        //-- 得分
        score : cc.Label,
      
        //-- 方块预制列表
        rockList : [cc.Prefab],
      
        //-- 房子与方块盒子
        box : cc.Node,

        //-- 方块容器盒子
        rokeListBox : cc.Node,

        rokeVineList : cc.Node,

        //-- 下一块提示区
        nextArea : cc.Node,

        //-- 生命预制
        lovePrefab : cc.Prefab,

        //-- 生命显示区
        lifeArea : cc.Node,

        //-- 魔法显示区
        magicArea : cc.Node,

        //-- 平台预制
        planePrefab : cc.Prefab,

        //-- 石化预制
        rokeStonePre : [cc.Prefab],

        //-- 搞怪预制
        jokePre : [cc.Prefab],

        //-- 藤蔓预制
        vinePre : [cc.Prefab],

        //-- 背景预制
        bgPre : cc.Prefab,

    },


    onLoad () {
        //-- 方块水平速度
        this.speedX = 290;

        //-- 最高方块位置y数组
        this.rokeYArr = [];

        //-- 运动开关
        this.fallFlag = true;

         // 物理引擎开启
        cc.director.getPhysicsManager().enabled = true;

        // 物理引擎随着相机动
        var theCamera = cc.find("Canvas/Layout/cameraBox").getComponent("CameraCtrl");        
        cc.director.getPhysicsManager().attachDebugDrawToCamera(theCamera.camera);
        cc.director.getCollisionManager().attachDebugDrawToCamera(theCamera.camera);

        //-- 初始化生命能量
        this.loves = [null,null,null];
      
        //-- 加载预制方块
        this.creatRoke();
        
        //-- 方向控制
        this.touchListen();

        //-- 生成生命能量
        this.creatLife();

        //-- 生成魔法道具
        this.magicName = ["lightNing","shovel","plane","caneVine"];

        this.schedule(function() {
            this.theNum = Math.floor(Math.random()*4);
            this.creatMagic();
        }, 5);
 
    },

    /**
     * 加载预制方块
     */ 
    creatRoke : function(){  
  
        this.randNum = Math.floor(Math.random()*7) ;
        var index = 0;

        if(Math.random()>0.9){
            Math.random()>0.5 ? index = 0:index = 1
            this.rock = cc.instantiate(this.jokePre[index]);   
            this.box.addChild(this.rock );
        }else{
            this.rock = cc.instantiate(this.rockList[this.randNum]);  
            this.rokeListBox.addChild(this.rock ); 
            
            // if(Math.random()>0.5 ){
            //     var actionTo = cc.scaleTo(0.2, 2, 2);
            //     this.rock.runAction(actionTo);
            // }else{
            //     this.rock.scaleX = 1
            //     this.rock.scaleY = 1
            // }

            //-- 初始化皮肤
            this.skinInit("rokes");
        }

        this.rock.y = 600;
        
        //-- 加入指引背景
        this.box.getChildByName("guideBg").width = this.rock.width;

        //-- 预提示下个方块切换
        this.changeTexture("roke" +(this.randNum + 1) )
        
    },    

    /**
     * 方块皮肤初始化
     */ 
    skinInit : function(turnName){
        
        var sprite = this.rock.getComponent(cc.Sprite);
        var url = cc.url.raw("resources/"+ turnName +"/roke" + (this.randNum + 1 ) + ".png");
        cc.loader.load(url, function (err, texture) {
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        });
 
    },

    /**
     * 预提示下个方块切换
     */ 
    changeTexture: function (str) {
        this.nextArea.removeAllChildren()
        var nextRock = new cc.Node();
        var sprite = nextRock.addComponent(cc.Sprite);
        sprite.spriteFrame = new cc.SpriteFrame();
        var url = cc.url.raw("resources/rokes/" + str + ".png");
        sprite.spriteFrame.setTexture(url);     
        this.nextArea.addChild(nextRock);
    },

    /**
     * 方向控制
     */ 
    touchListen : function(){
        var self = this;
        //-- 向左按钮
        this.scaleBtn(this.leftBtn,0.9,function(){
            console.log("方块向左移动");
            self.rock.getComponent("Rock").speedX = -self.speedX;
        },function(){
            self.rock.getComponent("Rock").speedX = 0;
        })

        //-- 向右按钮
        this.scaleBtn(this.rightBtn,0.9,function(){
            console.log("方块向右移动");
            self.rock.getComponent("Rock").speedX = self.speedX;
        },function(){
            self.rock.getComponent("Rock").speedX = 0;
        })

        //-- 向下按钮
        this.scaleBtn(this.downBtn,0.9,function(){
            console.log("方块向下加速移动");
            self.rock.getComponent("Rock").speedY -= 100;
        },function(){
            self.rock.getComponent("Rock").speedY = -150;
            cc.director.resume();
        })

        //-- 向上按钮变化
        this.scaleBtn(this.upBtn,1,function(){
            //-- 旋转
            self.rock.rotation += 90 ;

            //-- 旋转时指导背景变换
            if(self.rock.rotation/90%2 == 0){
                self.box.getChildByName("guideBg").width = self.rock.width;
            }else{
                self.box.getChildByName("guideBg").width = self.rock.height;
            }

            
        })

        //-- 测试键盘操作
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyBoadDn, this );
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyBoadUp, this );
    },

    /**
     * 缩小按钮功能
     * @param node target 按钮目标
     * @param range scaleVal 缩小范围
     * @param function startCallBack 触碰开始回调
     * @param function endCallBack 触碰结束回调
     */
    scaleBtn : function(target,scaleVal,startCallBack,endCallBack){

        var action1 = cc.scaleTo(0.1,scaleVal);
        var action2 = cc.scaleTo(0.1,1); 
        target.on(cc.Node.EventType.TOUCH_START,(event) =>{
            target.runAction(action1);
            if(startCallBack){startCallBack(target);}
            
        });

        target.on(cc.Node.EventType.TOUCH_END,(event) =>{               
            target.runAction(action2);     
            if(endCallBack){endCallBack(target);}
        });

        target.on(cc.Node.EventType.TOUCH_CANCEL,(event)=>{
            this.rock.getComponent("Rock").speedX = 0;    
            target.runAction(action2);
        });

    },

    //-- 测试用
    onKeyBoadDn: function(event) {

        if (event.keyCode == cc.KEY.right) {

            this.rock.getComponent("Rock").speedX = this.speedX;
        } else if (event.keyCode == cc.KEY.left) {
            this.rock.getComponent("Rock").speedX = -this.speedX;

            
        }else if (event.keyCode == cc.KEY.down) {
            this.rock.getComponent("Rock").speedY -= 100;
 
            if(this.rock.getComponent("Rock").speedY <= -500){
                this.rock.getComponent("Rock").speedY = -500;
            }

        }else if (event.keyCode == cc.KEY.up) {
            //-- 旋转
            this.rock.rotation += 90 ;

            //-- 旋转时指导背景变换
            if(this.rock.rotation/90%2 == 0){
                this.box.getChildByName("guideBg").width = this.rock.width;
            }else{
                this.box.getChildByName("guideBg").width = this.rock.height;
            }
        }

    },

    onKeyBoadUp: function(event) {

        if (event.keyCode == cc.KEY.right) {
            this.rock.getComponent("Rock").speedX = 0;
        } else if (event.keyCode == cc.KEY.left) {
            this.rock.getComponent("Rock").speedX = 0;
        }else if (event.keyCode == cc.KEY.down) {
            this.rock.getComponent("Rock").speedY = -150;
        }

    },

    /**
     * 生成生命能量
     */ 
    creatLife : function(){
        for(var i=0;i<3;i++){
            var lovePre = cc.instantiate(this.lovePrefab);
            lovePre.width = (this.lifeArea.width-30)/3;
            lovePre.height = this.lifeArea.height-10;
            this.lifeArea.addChild(lovePre);
            lovePre.setPosition(5+(5+lovePre.width)*i+lovePre.width/2,0);
            this.loves[i] = lovePre;
        }
    },
    

    
    /**
     * 生成魔法道具
     */ 
    creatMagic : function(){
        this.magicArea.removeAllChildren();
        var magicNode = new cc.Node();
        var sprite = magicNode.addComponent(cc.Sprite);
        sprite.spriteFrame = new cc.SpriteFrame();
        var url = cc.url.raw("resources/magic/" + this.magicName[this.theNum] + ".png");
        cc.loader.load(url, function (err, texture) {
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        });
        this.magicArea.addChild(magicNode);
        
    },

    /**
     * 释放魔法道具
     */
    onPlayMagic :function(){

        
        switch(this.theNum){
            case 0 : 
                this.magicLight();
                break;
            case 1 : 
                this.magicShovel();
                break;
            case 2 : 
                this.magicPlane();
                break;
            case 3 : 
                this.magicCane();
                break;
        }
        this.magicArea.removeAllChildren();
        this.theNum = null;
    },

    /**
     * 暂停游戏选择返回or继续
     */ 
    onBackGame : function(){
        console.log("暂停游戏")
        cc.director.pause();
    },
    
    /**
     * 生成背景
     */ 
    spawnBg : function(index){
        var theBg = cc.find("Canvas/Layout/gameView/bg");
        var bgPreFab = cc.instantiate(this.bgPre);
        bgPreFab.setPosition(0,1990 + 1136*(index - 5));
        bgPreFab.parent = theBg;
        // theBg.addChild(bgPreFab);

    },


    
/* ---------------------魔法道具列表------------------- */
    //-- 闪电魔法
    magicLight : function(){
        if(this.rokeListBox.children.length > 1){
            var last = this.rokeListBox.children[this.rokeListBox.children.length - 2];
            last.destroy();

        }
        
        // cc.log(this.box.children)
    },

    //-- 铲子魔法
    magicShovel : function(){
        var tag = this.rock.getComponent(cc.PhysicsPolygonCollider).tag ;
        if(tag != 2){
            this.skinInit("rokesStone");
            this.rock.getComponent(cc.PhysicsPolygonCollider).tag = 1;
        }
        


    },

    //-- 平台魔法
    magicPlane : function(){
  
        var rokeItem  = this.rokeListBox.children;
        this.rokeYArr = [];
        for(var i=0;i<rokeItem.length;i++){
            // cc.log(rokeItem[i].y)
            this.rokeYArr.push(rokeItem[i].y);
            
        }
        this.rokeYArr.pop();
        var max = Math.max.apply(null,this.rokeYArr)

        //-- 随机生成左右平台 
        var plane = cc.instantiate(this.planePrefab);
        if(Math.random()>0.5){
            plane.scaleX = 1
            plane.x = 200;
        }else{
            plane.scaleX = -1
            plane.x = -200;
        }
        plane.y = max + 150;
        this.box.addChild(plane)
    },

    //-- 藤蔓魔法
    magicCane : function(){
        var rokeItem  = this.rokeListBox.children;
        for(var i=0;i<rokeItem.length - 1;i++){
            var nodeThe = rokeItem[i]
            if(nodeThe){
                var vinePreThe = cc.instantiate(this.vinePre[nodeThe.name.split("roke")[1] - 1]);
                vinePreThe.setPosition(nodeThe.x,nodeThe.y);
                vinePreThe.rotation = nodeThe.rotation;
                this.rokeVineList.addChild(vinePreThe);
            }
            //-- 统一清除
            if( i == rokeItem.length - 2){
                for(var j=0;j<rokeItem.length - 1;j++){
                    rokeItem[j].destroy();
                }
                
            }
        }
        
    },

});

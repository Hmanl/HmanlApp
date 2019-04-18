var BallScript = (function (_super) {

    function BallScript() {
        BallScript.super(this);		
    }
    Laya.class(BallScript, "BallScript", _super);
    
    var _proto = BallScript.prototype;

    /**
    * 脚本实例化完成载入后调度
    *  owner 脚本绑定的3D物体
    */
    _proto._load = function (owner) {
        //-- 获取球体对象
        this.ball = this.owner;
        this.ball.tag = "nomal";
        console.log("this ",this);

        //-- 获取相机对象
        this.camera = LayaAir3D.camera;
        this.fly3DSp = this.ball.getChildByName("fly")
    
        this.id = Math.random();
        
        //-- 台阶3d点位置数组
        this.dieFloorList = LayaAir3D.dieFloorList;

        //-- 山峰3d点位置数组
        this.cylindeList = LayaAir3D.cylindeList;
        
        //-- 初始小球速度
        this.speedZ = -0.08;

        //-- 初始小球重力
        this.garvatiy = -0.12;

        //-- 初始相机重力
        this.garvatiyCa = -0.12;
        
        //-- 计时器持续时间
        this.duration = 5;

        this.garvkeep = 0
        
        //-- 滚动开关
        this.maskFlag = false;
        
        //-- 加速开关
        this.speedUpFlag = true;

        //-- 减速开关
        this.speedDnFlag = true;

        //-- 跳跃开关
        this.jumpFlag = false;

        //-- 升空开关
        this.flyFlag = false;

        //-- 飞行开关
        this.skyFlag = true;

        //-- 坠落开关
        this.fallDownFlag = true;

        //-- 竹蜻蜓升空开关
        this.flyToolFlag = true;

        //-- 碎板子运动开关
        this.breakFlag = false;

        //-- 弹跳开关
        this.bounceFlag = true;
        
        this.breakSpeed = -0.05;

        //-- 加速减速跳跃初始值
        this.speedUpZ =  this.speedDnZ = -0.08;
        this.speedGa = 0;
        this.jumpSpeedY = 0.1;
        this.flySpeedY = 0.1;
        this.flyToolSpeedY = 0;
        this.ballSpeedY  = 0;
        this.bounceSpeedY = 0.04

        this.ball.transform.translate(new Laya.Vector3(0,-0.1 ,0), false);

        //-- 计分开关
        this.liveFlag = true;

        //-- 球的旋转角度
        this.ballRoate = -15;

        //-- 弹簧第三个超级跳跃计数
        this.jumpTimes = 0;
        this.jumpNums = 3;

        //-- 加速带第三个超级跳跃计数
        this.speedTimes = 0
        this.speedNums = 3;
        
        //-- 分数额外奖励数值
        this.addNums = 0;
       
        this.temp = -0.04

        //-- 重力感应
        this.accelerometerFun();


        
    }
    
   _proto._update = function (owner) {
        
        this.points =  Math.floor(-this.ball.transform.position.z*10)
        
        //-- 动态检测并创建元素
        this.onFrameLoop();
        
        if(!this.liveFlag ) return
     
        Laya.gameView.score.text =  this.points + this.addNums;

        // console.log(this.addNums)

        //-- 动态显示获奖语
        //  this.awardShow(Laya.gameView.score.text);

    }



    /*台阶回收后再取出创建*/
    _proto.onFrameLoop = function(){  
        //-- 球的旋转 
        LayaAir3D.ballSp.transform.rotate( new Laya.Vector3(this.ballRoate,0,0),false,false);

        //-- 创建台阶
        if( LayaAir3D.dieFloorList[LayaAir3D.dieFloorList.length -1] &&  this.ball.transform.position.z < LayaAir3D.dieFloorList[LayaAir3D.dieFloorList.length -1].z  + 12 ){
            this.removeStep();
            LayaAir3D.prototype.spawnStep(LayaAir3D.dieFloorList[LayaAir3D.dieFloorList.length -1].y - 4 ,LayaAir3D.dieFloorList[LayaAir3D.dieFloorList.length -1].z - 5.1 )
            LayaAir3D.prototype.spawnDeathBorder(LayaAir3D.dieDeathList[LayaAir3D.dieDeathList.length -1].y - 4 ,LayaAir3D.dieDeathList[LayaAir3D.dieDeathList.length -1].z - 5.1 )


        }
       
        //-- 创建山峰
        if(LayaAir3D.cylindeList[0] &&  this.ball.transform.position.z < LayaAir3D.cylindeList[0].z +30){
            LayaAir3D.prototype.createCylinder(0.8,LayaAir3D.cylindeList[0].y -3 ,LayaAir3D.cylindeList[0].z -4)
        }

    }

    /*台阶回收到对象池里*/
    _proto.removeStep = function(){
        
        while(LayaAir3D.floorList.length > 5){
            var floor = LayaAir3D.floorList.shift();
            LayaAir3D.dieFloorList.shift();
            laya.utils.Pool.recover("floor",floor);

            var death = LayaAir3D.deathList.shift();
            LayaAir3D.dieDeathList.shift();
            laya.utils.Pool.recover("death",death);

        } 
    }

    /*动态显示获奖语*/
    _proto.awardShow = function(score){
        var scoreNow = Number(score);
        lx.global.mstorage.setItem()
        var skinListData = lx.global.mstorage.getItem("skinListData");
		var theList ;

        var ballNameCfg = lx.global.mstorage.getItem("ballNameCfg");
        var theBallCfg  = ballNameCfg;


		if(skinListData){
			theList = skinListData;
            
		}else{
			theList = Config.skinList;
		}

		for(var i=0;i<theList.length;i++){
			var skinItem = theList[i];
            var ballNameItem = theBallCfg[i];

			if(  Number(skinItem.coinNums) ==  score  &&  ballNameItem.flag == 0){
                 Laya.gameView.giftTip.text = "恭喜解锁" + ballNameItem.name;
                 theBallCfg[i].flag = 1;
                 Laya.gameView.giftTip.visible = true;
                 setTimeout(function(){
                    Laya.gameView.giftTip.visible = false;
                 },1000)
                 
			}		
		}
        //lx.global.mstorage.setItem("ballNameCfg" , lx.getStorageSync("ballNameCfg"))                                                                                                                                                                                                                
        //lx.setStorageSync("ballNameCfg", lx.global.mstorage.getItem("ballNameCfg"));
    },

    /**
     * 当其他碰撞器进入绑定物体碰撞器时触发（球体碰到台阶时）
     * 注：如相对移动速度过快，可能直接越过
     */
    _proto.onTriggerEnter = function (other) {
        //-- 碰撞标识 
        var target = other.owner.name;
        // console.log(target);
        switch(target){
            case "paodao" : 
                this.beginFunPaodao(other); //-- 跑道的碰撞开始函数
                break;
            case "jiasu" : 
                this.beginFunJiasu(other);  //-- 加速带碰撞开始函数
                break;
            case "jiansu" : 
                this.beginFunJiansu(other); //-- 减速带碰撞开始函数
                break;
            case "mushroom" : 
                this.beginFunMash(other);   //-- 蘑菇的碰撞开始函数
                break;
            case "tiaoyue" : 
                this.beginFunTiaoyue(other);//-- 跳跃带碰撞开始函数
                break;
            case "fly" : 
                if(other.owner.tag == "tool"){
                    this.beginFunFly(other);//-- 飞行的碰撞开始函数
                }
                break;
            case "target" : 
                this.beginTarget(other);    //-- 靶子的碰撞结束函数
                break;
            case "paodao_break" : 
                this.beginPaodaoBreak(other);//-靶子的碰撞结束函数
                break;
            case "death" : 
                if(!Config.isOver){
                    this.beginFunLive(other);//-- 复活的碰撞开始函数
                }
                
                break;
        }

        
    }

    /**
     * 当其他碰撞器进入绑定物体碰撞器后逐帧触发（球体进入台阶时）
     * 注：如相对移动速度过快，可能直接越过
     */
    _proto.onTriggerStay = function (other) {
 
     
    }

    /**
     * 当其他碰撞器退出绑定物体碰撞器时逐帧触发（子弹穿出物品时）
     * 注：如相对移动速度过快，可能直接越过
     */
   _proto.onTriggerExit = function (other) {
        var target = other.owner.name;
        
        switch(target){
            case "paodao" : 
                this.endFunPaodao(other); //-- 跑道的碰撞结束函数
                break;
            case "jiasu" : 
                this.endFunJiasu(other);  //-- 加速带碰撞结束函数
                break;
            case "jiansu" : 
                this.endFunJiansu(other); //-- 减速带碰撞结束函数
                break;
            case "mushroom" : 
                this.endFunMash(other);   //-- 蘑菇的碰撞结束函数
                break;
            case "tiaoyue" : 
                this.endFunTiaoyue(other);//-- 跳跃带碰撞结束函数
                break;
            case "fly" : 
                if(other.owner.tag == "tool"){
                    this.endFunFly(other);    //-- 复活的碰撞结束函数
                }            
                break;
            case "paodao_break" : 
                this.endFunPaodaoBreak(other); //-- 跑道的碰撞结束函数
                break;   
        }

    }

    /**
     * 跑道碰撞开始函数
     */
    _proto.beginFunPaodao = function(other){
        
        console.log("碰撞跑道开始");
        this.fallDownFlag = true;
        this.ballRoate = -15;
        this.speedGa = 0;
        this.speedUpFlag = true;
        
        this.jumpFlag = true
        this.speedUpZ = -0.08;
        
        //-- 解决穿透问题
        this.dealThrough(other);
        

        if(this.bounceSpeedY < 0){
            this.bounceFlag = true;
            
        }
        

        if(this.ball.acName == "Tiaoyue" || this.ball.acName == "Jiasu" || this.ball.acName == "Fly" ){
            this.maskFlag = true;
            this.bounceFlag = false;

            this.bounceSpeedY = 0.04;
            Laya.timer.loop(this.duration , this, this.onBounce);
            this.ball.acName = ""
        }

        
        
        //-- 防止多次碰撞other.owner.coliobj.tag == 0
        // console.log(other.owner.coliobj.tag)

        // if(other.owner.coliobj.tag == 0){
        //     this.bounceFlag = false;
        //     other.owner.coliobj.tag = 1;
        //     Laya.timer.loop(this.duration , this, this.onBounce);

        // }

        if(!this.bounceFlag){
            // Laya.timer.loop(this.duration , this, this.onBounce);

        }else{
            // this.bounceSpeedY = 0.04;
            this.bounceFlag = true;
            this.garvatiyCa = this.garvatiy = 0;
            // this.speedZ = -0.08;
            this.maskFlag = false;
            Laya.timer.loop(this.duration , this, this.onLoop);
        }

        

    }   

    /**
     * 跑道碰撞结束函数
     */
     _proto.endFunPaodao = function(other){
        // console.log("碰撞结束");

        // if(other.owner.coliobj.tag == 0){
        //     this.bounceSpeedY = 0;
        //     this.bounceFlag = false;
        // }
   
        
        this.garvatiyCa =this.garvatiy = this.speedZ +this.temp;
        // this.speedZ = - 0.08;

        Laya.timer.loop(this.duration , this, this.onLoop);
     }


    /**
     * 加速带碰撞开始函数
     */
    _proto.beginFunJiasu= function(other){
        if(this.speedZ > -0.13){
            this.speedZ += -0.01;           
        }else{
            this.speedZ = -0.15; 
        }
    
        this.ball.acName = "Jiasu";
        this.temp = -0.05;

        console.log("碰撞加速带开始");
        this.maskFlag = this.speedDnFlag = this.bounceFlag =  this.jumpFlag = true;
        this.speedUpFlag = false;
        this.ballRoate = -30;
        this.fallDownFlag = true;
        this.speedTimes++;
        this.speedGa = 0;

        //-- 配置第几个为超级跳跃
        // if(this.speedTimes == this.speedNums){
        //     this.speedTimes = 0;
        //     this.speedUpZ = -0.12
        //     console.log("第" + this.speedNums + "个");
        // }

        Laya.timer.loop(this.duration , this, this.onSpeedUp);
    }

    /**
     * 加速带碰撞结束函数
     */
    _proto.endFunJiasu = function(other){
        // console.log("碰撞加速带结束");
        var self = this;
        if(!this.speedUpFlag){
            // setTimeout(function(){
            //     self.maskFlag = false;
            //     self.speedUpFlag = true;
            //     self.speedUpZ = -0.08;
            //     self.speedGa = 0;
            // },1600)
        }
    }

    /**
     * 减速带碰撞开始函数
     */
    _proto.beginFunJiansu= function(other){

        if(this.speedZ < -0.08){
            this.speedZ += 0.01;
            // this.temp = 0.05;
        }else{
            this.speedZ = -0.08;
            // this.temp = -0.04;
            
        }
        this.temp = -0.04;

        this.maskFlag = this.speedUpFlag =  this.jumpFlag =  this.bounceFlag = this.fallDownFlag = true;
        this.speedDnFlag = false; 
        this.ballRoate = -20;
        Laya.timer.loop(this.duration , this, this.onSpeedDn);
        // lx.config.platform == "weixin"
        if(Laya.Browser.onWeiXin){
            lx.vibrateShort();

            setTimeout(function(){
                lx.vibrateShort();
            },15)

        }
    }

    /**
     * 减速带碰撞结束函数
     */
    _proto.endFunJiansu = function(other){
         // console.log("碰撞减速带结束");
        var self = this;
        if(!this.speedDnFlag){
            setTimeout(function(){
                self.maskFlag = false;
                self.speedDnFlag = true;
                self.speedDnZ = -0.05;
                // self.speedZ = - 0.07;
                // self.garvatiyCa =self.garvatiy = -0.2;
            },200)
        }
        
    }

    /**
     * 蘑菇碰撞开始函数
     */
    _proto.beginFunMash = function(other){
        this.maskFlag = false;
        this.speedUpFlag = this.bounceFlag = this.fallDownFlag =  this.jumpFlag = true;
        this.ball.acName = "Mash";
        var self = this;
        var timer1 =  setTimeout(function(){
            
            other.owner&&( other.owner.destroy());
        },20);
        this.timer2 && clearTimeout(this.timer2);
        
        if(other.owner.theName == "mushRoomRed"){
            this.ball.tag = "big";
            // console.log("碰撞红蘑菇");
            this.ball.transform.scale = new Laya.Vector3(1.5, 1.5, 1.5);
            this.ball.transform.translate(new Laya.Vector3(0, 0.1, 0),false);
            this.camera.transform.translate(new Laya.Vector3(0, 0.1, 0),false);

        }else if(other.owner.theName == "mushRoomGn"){
            // console.log("碰撞绿蘑菇");
            this.ball.tag = "small";
            this.ball.transform.scale = new Laya.Vector3(0.8, 0.8,0.8); 
        }
        
        this.timer2 =setTimeout(function(){
            self.ball.tag = "nomal";
            self.ball.transform.scale = new Laya.Vector3(1, 1, 1);
        },5000);
        Laya.timer.clearAll(Laya.gameView.countDnText)	
        
        Laya.gameView.countDnText.visible = true;
        Config.timeOut(5,5,Laya.gameView.countDnText)

    }    

    /**
     * 蘑菇碰撞结束函数
     */
     _proto.endFunMash  = function(other){

     }

     /**
     * 跳跃带碰撞开始函数
     */
    _proto.beginFunTiaoyue = function(other){
        this.fallDownFlag = true;
        this.maskFlag =  this.speedDnFlag =  true;
        this.jumpFlag = false;
        this.jumpSpeedY = 0.1
        this.jumpTimes++;

        this.ball.acName = "Tiaoyue"

        //-- 配置第几个为超级跳跃
        // if(this.jumpTimes == this.jumpNums){
        //     this.jumpTimes = 0;
        //     this.jumpSpeedY = 0.12;
        // }
        Laya.timer.loop(this.duration , this, this.onJump);
    }

    /**
    * 跳跃带碰撞结束函数
    */
    _proto.endFunTiaoyue  = function(other){
        // var self = this;
            
        // setTimeout(function(){
        //     self.maskFlag = false;
        //     self.jumpFlag = true;
        //     self.jumpSpeedY = 0;
        //     self.speedZ = - 0.1;
        //     self.garvatiyCa = self.garvatiy = -0.18;
        // },500)


    }

    /**
     * 飞行道具碰撞开始函数
     */
    _proto.beginFunFly = function(other){
        this.fallDownFlag = true;
        this.maskFlag =  this.speedUpFlag = this.speedDnFlag = this.bounceFlag = this.jumpFlag =  true;
        this.flyFlag = false;
        this.ballRoate = 0;
        this.ball.acName = "Fly"

        this.flySpeedY = 0.1;
        this.flyToolSpeedY = 0;
        this.ballSpeedY  = 0;
        this.skyFlag = true;

        this.ball.transform.scale = new Laya.Vector3(1, 1, 1);

        var pos = other.owner.transform.position;
        Laya.timer.loop(this.duration  , this, this.onFly,[pos]);
        
        //-- 显示飞行道具
        var flyThe = this.ball.getChildByName("fly");
        var flyTop = flyThe.getChildByName("fly").getChildByName("joint1").getChildByName("top");
        var flyBot = flyThe.getChildByName("fly").getChildByName("bottom");

        var flyMaterial = new Laya.StandardMaterial();      
        flyMaterial.diffuseTexture = Laya.Texture2D.load("res/flySkin/fly01.jpg");  
        flyMaterial.albedo = new  Laya.Vector4(1.0,1.0,1.0,1); 
        flyMaterial.renderMode = 5;
        flyTop.meshRender.material = flyMaterial;
        flyBot.meshRender.material = flyMaterial;


        var flyAc =  LayaAir3D.ball.getChildByName("fly").getChildAt(0).getComponentByType(Laya.Animator);
        flyAc.play("Take 001",2);

        Laya.timer.once(100 , this, function(){
            other.owner.destroy();
        });
        
        Laya.timer.clearAll(Laya.gameView.countDnText)	
        Laya.gameView.countDnText.visible = true;
        Config.timeOut(9,9,Laya.gameView.countDnText)


        
    },

    /**
     * 飞行道具碰撞结束函数
     */
    _proto.endFunFly = function(other){
        //-- 创建靶子
        var self = this;
        var pos = other.owner.transform.position;
        this.flyToolFlag= true;
        

        LayaAir3D.prototype.createTarget(pos.y + 5,pos.z);

        //--空中飞行       
        Laya.timer.loop(self.duration , this, this.onSky);


        
        setTimeout(function(){
            console.log("stop")
            self.skyFlag = true;
            self.fallDownFlag = false;
            self.flyToolFlag= false;
            Laya.timer.loop(self.duration , self, self.onFlayTool);
            Laya.timer.loop(self.duration , self, self.onBallfall);
        },8700)
      
    },

     

     /**
     * 靶子道具碰撞开始函数
     */
     _proto.beginTarget = function(other){

        Laya.gameView.addScore.visible = true;
    
        this.addNums += 100


        Laya.timer.once(600 , this, function(){
            Laya.gameView.addScore.visible = false;
        });
     }


     
     /**
     * 碎板子碰撞开始函数
     */
     _proto.beginPaodaoBreak = function(other){
         console.log("碰撞碎板子开始")
        //-- 解决穿透问题
        this.dealThrough(other);


         this.jumpFlag = this.bounceFlag = this.speedUpFlag  = true;
         this.ball.acName == "Break";
         var stepBreak3DAc = other.owner.getComponentByType(Laya.Animator);
         stepBreak3DAc.play("Take 001",10.0);

         stepBreak3DAc.on(Event.STOPPED,this,function(){
             console.log("板子碎完了")
             other.owner.destroy();
         })

         this.breakFlag = false;
         switch(this.ball.tag){
            case "nomal" :
                this.ballNomalBk();
                break;
            case "big" :
                this.ballBigBk();
                break;
            case "small" :
                this.ballSmallBk();
                break;
         }
 

     }

    //-- 普通球碰到碎板子
    _proto.ballNomalBk = function(){
        var self = this;
        this.maskFlag = true;
        Laya.timer.loop(this.duration , this, this.onBreak);
        console.log(this.speedZ)
        if(this.speedZ >= -0.1){
             
             this.breakSpeed  = -0.05;
             Laya.timer.once(400 , this, function(){
                self.maskFlag = false;
                self.breakFlag = true;
                self.garvatiyCa =self.garvatiy = -0.12;
                self.speedZ = 0;
            });
            console.log(1)
        }else{
            this.breakSpeed  = this.speedZ;
 
            console.log(2)
        }
       

    }

    //-- 放大球碰到碎板子
    _proto.ballBigBk = function(){
        var self = this;
        Laya.timer.loop(this.duration , this, this.onBreak);
        this.maskFlag = true;
        Laya.timer.once(100 , this, function(){
            self.breakFlag = true;self.maskFlag = false;
           
            self.speedZ = 0;
        });

    }

    //-- 缩小球碰到碎板子
    _proto.ballSmallBk = function(){
        this.garvatiyCa = this.garvatiy = 0;
        // this.speedZ = -0.08;
        this.maskFlag = false;
        Laya.timer.loop(this.duration , this, this.onLoop);

    }


    /**
     * 跑道碰撞结束函数
     */
     _proto.endFunPaodaoBreak = function(other){
        // console.log("碰撞结束");
        if(this.ball.tag == "small"){
            
            this.garvatiyCa = this.garvatiy = this.speedZ + this.temp;
            
        }else{
             this.garvatiyCa =this.garvatiy = -0.12;

        }
        this.breakFlag = true;
        this.maskFlag = false;    
        Laya.timer.loop(this.duration , this, this.onLoop);
     }



    /**
     * 死亡边界之复活碰撞开始函数
     */
     _proto.beginFunLive = function(other){
        if(typeof(sharedCanvas) != "undefined"){
            Config.accelerometer.stopAccelerometer();
        }
        Accelerator.instance.off(Laya.Event.CHANGE,  LayaAir3D,  LayaAir3D.prototype.onDeviceorientation);
        console.log("碰撞死亡开始")
        Config.isOver = true;
        this.liveFlag = false;
        this.maskFlag = false;
        this.speedUpFlag = this.speedDnFlag = this.jumpFlag = this.fallDownFlag = this.bounceFlag =  true;
        this.ball.acName == "Death"; 
        
        var myInfo = {"myScore": Laya.gameView.score.text};			
        lx.setStorageSync("myInfo",myInfo )

        if(Config.istake){
            this.speedZ = 0;
            this.garvatiyCa = 0;
            this.garvatiy -= 0.01;         
            this.ballRoate = 0;
            Laya.timer.once(300,this,function(){
                this.maskFlag = true;
            }.bind(this))
            console.log(this.garvatiy)
            //-- 复活界面
            Laya.reliveView = new ReliveView();
            Laya.stage.addChild(Laya.reliveView);  
        }else{
            this.beginFunDeath(other);
        }
     }

    /**
     * 死亡边界之死亡碰撞开始函数
     */
    _proto.beginFunDeath = function(other){
        
        var self = this;
     
        this.speedZ = 0;
        this.garvatiyCa = 0;
        this.garvatiy -= 0.01;
        Laya.timer.once(300,this,function(){
            this.maskFlag = true;
            Laya.gameOver.visible = true;
        }.bind(this))

 

        Laya.gameOver.endScore.text = "最终得分："  + Laya.gameView.score.text;

            
            lx.postMessage({
                message: JSON.stringify({tag:"postUserScore", data:{score: Laya.gameView.score.text}})
            });
            
            

            var highScore =  lx.getStorageSync("highScore");
            
            if(!highScore){
                Laya.gameOver.hisScore.text = "历史最高分：0";
                lx.setStorageSync("highScore",Laya.gameView.score.text);
            }else{           
                if( Number( highScore) < Number(Laya.gameView.score.text )){
                    lx.setStorageSync("highScore",Laya.gameView.score.text);  
                }
                Laya.gameOver.hisScore.text = "历史最高分：" + highScore;
            }

            var theScore = Laya.gameView.score.text;

 
            //-- 解锁皮肤
            var skinListData = lx.getStorageSync("skinListData");
            var theList ;
            if(skinListData){
                theList = skinListData;
            }else{
                theList = Config.skinList;
            }
            for(var i=0;i<theList.length;i++){
                var skinItem = theList[i];
                if(skinItem.btnStatus == 0 &&  skinItem.coinNums <= Number(theScore)){
                    skinItem.btnStatus = 2;
                    theList[i] = skinItem;
                    
                }
            }

            lx.setStorageSync("skinListData",theList);
            
            
            lx.postMessage({
                message: JSON.stringify({tag:"getUserScore"})
            });
            Laya.timer.once(300,this,function(){
                LayaAir3D.prototype.showRank("getSmallRankList");
            }.bind(this))

            
        

        

    }


    /**
     * 碰到阶梯状态
     */
     _proto.onLoop = function(){
         if(!this.maskFlag){
            //  console.log( this.garvatiy, this.speedZ)
             this.camera.transform.translate(new Laya.Vector3(0, this.garvatiyCa, this.speedZ), false);
             this.ball.transform.translate(new Laya.Vector3(0, this.garvatiy,this.speedZ), false);
            //  console.log(1)
        }
         

    }

   


    /**
     * 加速状态
     */
     _proto.onSpeedUp = function(){
        if(!this.speedUpFlag){
            this.speedGa -= 0.0018;
            this.speedUpZ -= 0.0008;
            this.camera.transform.translate(new Laya.Vector3(0, this.speedGa , this.speedZ), false);
            this.ball.transform.translate(new Laya.Vector3(0, this.speedGa , this.speedZ), false);
            // console.log(2)
        }

    }

    /**
     * 减速状态
     */
    _proto.onSpeedDn= function(){
        if(!this.speedDnFlag){
            
            this.speedDnZ += 0.0002;
            this.camera.transform.translate(new Laya.Vector3(0, 0,  this.speedDnZ), false);
            this.ball.transform.translate(new Laya.Vector3(0, 0, this.speedDnZ), false);
        }
        
    }

    /**
     * 跳跃状态
     */
    _proto.onJump= function(){
        if(!this.jumpFlag){
            if(this.jumpSpeedY > 0){
                this.jumpSpeedY -= 0.003;
            }else{
                this.jumpSpeedY = this.speedZ + this.temp;
            }
            // this.jumpSpeedY -= 0.003;
            this.camera.transform.translate(new Laya.Vector3(0,this.jumpSpeedY,this.speedZ), false);
            this.ball.transform.translate(new Laya.Vector3(0,this.jumpSpeedY,this.speedZ), false);

        }
        
    }

    /**
     * 升空状态
     */
    _proto.onFly = function(pos){    
        
        if(!this.flyFlag){   
            this.flySpeedY += 0.004;
            this.camera.transform.translate(new Laya.Vector3(0,this.flySpeedY,0), false);
            this.ball.transform.translate(new Laya.Vector3(0,this.flySpeedY,0), false);



            //-- 小球到达飞靶子高度基于飞行器位置
            if(this.ball.transform.position.y >= pos.y +5){
                this.flyFlag = true;  
                this.skyFlag = false;
                          
            }


        }
        
    }

     /**
     * 直升道具升空状态
     */
    _proto.onFlayTool= function(){
        if(this.flyToolSpeedY >= 0.12){
            this.fly3DSp.destroy();
            this.ball.addChild(LayaAir3D.prototype.createBallFly());
            //-- 飞行道具加速旋转
            var flyAc =  LayaAir3D.ball.getChildByName("fly").getChildAt(0).getComponentByType(Laya.Animator);
            flyAc.play("Take 001",2);
            this.fly3DSp = this.ball.getChildByName("fly")
            // return; 
        }else{

            if(!this.flyToolFlag){
                this.flyToolSpeedY += 0.004;
                this.fly3DSp.transform.translate(new Laya.Vector3(0,this.flyToolSpeedY,0), false);
            }

            
        }


        

    }

    
    /**
     * 坠落状态
     */
    _proto.onBallfall= function(){
        if(!this.fallDownFlag){
            this.ballSpeedY -= 0.004;
            this.camera.transform.translate(new Laya.Vector3(0,this.ballSpeedY,-0.04), false);
            this.ball.transform.translate(new Laya.Vector3(0,this.ballSpeedY,-0.04), false);
            // console.log(3)
        }
        
        
        
    }
    
    
    /**
     * 飞行状态
     */
    _proto.onSky= function(){
        if(!this.skyFlag){
            this.camera.transform.translate(new Laya.Vector3(0,-0.094,-0.12), false);
            this.ball.transform.translate(new Laya.Vector3(0,-0.094,-0.12), false);
        }
        
    }
    
    /**
     * 在碎板子上的状态
     */
    _proto.onBreak = function(){
        if(!this.breakFlag){
            this.camera.transform.translate(new Laya.Vector3(0,0,this.breakSpeed ), false);
            this.ball.transform.translate(new Laya.Vector3(0,0,this.breakSpeed ), false);
        
        }
        
    }
    
    /**
     * 弹跳状态
     */
    _proto.onBounce = function(){
        
        if(!this.bounceFlag){
            if(this.bounceSpeedY > 0){
                this.bounceSpeedY -= 0.0025;
            }else{
                
                this.bounceSpeedY = this.speedZ + this.temp;
            }
            this.camera.transform.translate(new Laya.Vector3(0,this.bounceSpeedY,this.speedZ), false);
            this.ball.transform.translate(new Laya.Vector3(0,this.bounceSpeedY,this.speedZ), false);
            // console.log(4)
        }


    }


     /**
     * 重力感应
     */ 
     _proto.accelerometerFun = function(){
        if(typeof(sharedCanvas) != "undefined"){
            Config.accelerometer.startAccelerometer(function(rotationInfo){

                var instacne = 0.1;    
                var limit = 0.45;
                var ballPosX = LayaAir3D.ball.transform.position.x;
                // LayaAir3D.info.text =  "gamma:" +  rotationInfo.x ;


                if(ballPosX > limit){
                    LayaAir3D.ball.transform.position.x = limit
                }else  if(ballPosX < -limit){
                    LayaAir3D.ball.transform.position.x = -limit
                }  
                LayaAir3D.ball.transform.translate(new Laya.Vector3(instacne*rotationInfo.x,0, 0), false);

            });
     

        }else{

            Accelerator.instance.on(Laya.Event.CHANGE, LayaAir3D,  LayaAir3D.prototype.onDeviceorientation);
        }
     }

    /**
    * 重力感应
    */ 
    _proto.dealThrough = function(other){
        //-- 解决穿透问题(穿透多少位移上来多少)
        var yDis = this.ball.getComponentByType(Laya.SphereCollider).radius + other.owner.getComponentByType(Laya.BoxCollider).size.y/2
        var yPos = this.ball.transform.position.y - other.owner.transform.position.y ;
        var freeDis =this.ball.getComponentByType(Laya.SphereCollider).radius - (yPos - other.owner.getComponentByType(Laya.BoxCollider).size.y/2)

        if(yPos < yDis){
            this.camera.transform.translate(new Laya.Vector3(0,freeDis,0), false);
            this.ball.transform.translate(new Laya.Vector3(0,freeDis,0), false);
            
        }
    }


    return BallScript;
})(Laya.Script);

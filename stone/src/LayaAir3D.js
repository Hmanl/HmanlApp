var LayaAir3D = (function () {
    function LayaAir3D() {
        //初始化微信小游戏
        Laya.MiniAdpter.init(true,false);

        //初始化引擎
        Laya3D.init(640, 1136, Laya.WebGL);

        //适配模式
        // Laya.stage.alignH = "center";

		// Laya.stage.alignV = "middle";
        Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;       
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;

        lx.config.set({
            gameid: 100100, 
            //mode : "production",
        });

        var self = this;
        var onAuthorizeSuccess = function(){
            lx.login({
                success: function(res){
                   
                    // self.loginSuccess();
                     
                },
                fail: function(res){
                    // self.loginFail(res);
                }
            });
        };
        var params = {
            scope: "scope.userInfo",
            before: function(){

                lx.log("before");
            },
            after: function(){
                lx.log("after");
            },
            fail: function(){
                //强制授权登陆成功
                lx.authorize(params);
            },
            success: onAuthorizeSuccess,
        };
        lx.authorize(params);
    

        Laya.stage.bgColor = "#888";
        console.log("我是主域加载完成" )
        //开启统计信息
        // Laya.Stat.show();

        // Laya.URL.basePath = "http://h5.lexun.com/games/wx/ballrun/";

        Laya.loader.create([
            {url:"res/LayaScene_ball/ball.lh"},
            {url:"res/LayaScene_fly/fly.lh"},          
            {url:"res/LayaScene_target/target.lh"},
        ],Laya.Handler.create(this, this.on3DComplete));
     

    }

    var _proto = LayaAir3D.prototype;

    /*加载3D资源完成回调*/
    _proto.on3DComplete = function(){
        //-- 测试文本   
        LayaAir3D.info = new Laya.Text();
        LayaAir3D.info.fontSize = 50;
        LayaAir3D.info.color = "#FFFFFF";
        LayaAir3D.info.size(Laya.stage.width, Laya.stage.height);
        LayaAir3D.info.pos(200,50)
        Laya.stage.addChild(LayaAir3D.info);


        //-- 鼠标按下的时候的x值
        this.currClickX = 0;
        this.speedX = 0.04;

        //初始化
        LayaAir3D.floorList = [];
        LayaAir3D.deathList = [];
        LayaAir3D.dieFloorList = [];
        LayaAir3D.dieDeathList = [];
        LayaAir3D.cylindeList = [];
        LayaAir3D.cylindepoolList = [];
        Config.istake = true;
        Config.isOver = false;

        //-- 创建3D场景
        this.createScene();
        
        //-- 创建3D场景雾化
        this.createSceneSmoke();

        //-- 创建3D摄像机
        this.createCamera();

        //-- 创建3D灯光
        this.createLight();

        //-- 创建unity3D球角色
        this.createBall();

        //-- 创建死亡边界
        this.deathBorder(-7,-1.2);

        //-- 创建unity3D阶梯和雪山 
        this.createThing();
       
        //-- 创建界面
        this.createView();

        //-- 创建子域
        this.showSon();

        //-- 监听屏幕事件
        // this.addlisten();
    
        
    }

    /*游戏开始*/
    _proto.createTween = function(){         
		//"LayaBox"字符串总宽度
        var w = 400;
        //文本创建的起始x位置(>>在此使用右移运算符，相当于/2 用>>效率更高)
        var offsetX = Laya.stage.width - w >> 1;
        //显示的字符串
        var demoString = "滚粗天际";
        var letterText = '';
        var box = new Laya.Box();
        box.name = "thebox"
        Laya.startView.removeChildByName("thebox");

        for(var i = 0,len = demoString.length;i<len;++i){
            //从"LayaBox"字符串中逐个提出单个字符创建文本
            letterText = createLetter(demoString.charAt(i),box);
            letterText.x = w/len*i+offsetX;
            //文本的初始y属性
            letterText.y = 100;
            //对象letterText属性y从缓动目标的100向初始的y属性300运动，每次执行缓动效果需要3000毫秒，缓类型采用elasticOut函数方式，延迟间隔i*100毫秒执行。
            Laya.Tween.to(letterText, { y : 300 }, 1000, Laya.Ease.elasticOut, null, i * 100);
        }
		
   }


	//创建单个字符文本，并加载到舞台
    function createLetter(char,box){
        
        var letter = new Laya.Text();
        letter.text = char;
        letter.color = "#ffffff";
        letter.font = "Impact";
        letter.bold = true;
        letter.fontSize = 80;

        box.addChild(letter);
        Laya.startView.addChild(box);
        return letter;
    }

    /*主域产生子域*/
    _proto.showSon = function(){   
       
        if(Laya.Browser.onWeiXin){
            
            //设置开放域画布大小
            Laya.Browser.window.sharedCanvas.width = 640;
            Laya.Browser.window.sharedCanvas.height = 1136;
            Laya.timer.once(10, this, function(e){
            //通过微信API: postMessage发消息到开放域，重新设置矩阵,注意：重新设置矩阵的调用不能去掉，否则在开放域的鼠标点击事件等都会有异常
                lx.postMessage({
                    message: JSON.stringify({tag:"setSize", data:{width:Laya.stage.width,height:Laya.stage.height,matrix:Laya.stage._canvasTransform}})
                });
            
                //下面代码在游戏中可根据需要时调用
                LayaAir3D.subTexture = new Laya.Texture(Laya.Browser.window.sharedCanvas);
                LayaAir3D.subContextSprite = new Laya.Sprite();
                //当前屏幕大小
                LayaAir3D.subContextSprite.size(640, 1136);
                LayaAir3D.subContextSprite.visible = false;  
                Laya.stage.addChild( LayaAir3D.subContextSprite);
                LayaAir3D.subContextSprite.graphics.drawTexture(LayaAir3D.subTexture,0,0,640,1136);
            });
            
        }else{
            onLoad();
        }

    }
    
    /*显示排行榜*/
    _proto.showRank = function(target){ 
        lx.postMessage({
            message: JSON.stringify({tag:target})
        });
        if(Laya.Browser.onWeiXin){
            LayaAir3D.subTexture.bitmap.alwaysChange = true;
            LayaAir3D.subContextSprite.visible = true; 
        }
    }

    /*隐藏排行榜*/
    _proto.hideRank = function(target){ 
        lx.postMessage({
            message: JSON.stringify({tag:target})
        });
        if(Laya.Browser.onWeiXin){
            LayaAir3D.subTexture.bitmap.alwaysChange = false;
            LayaAir3D.subContextSprite.visible = false; 
        }
        
    }

    /*创建3D场景*/
    _proto.createScene  = function(){        
        //-- 实例化场景
        LayaAir3D.scene = new Laya.Scene();
        Laya.stage.addChild(LayaAir3D.scene);

    }

    /*创建3D场景雾化*/
    _proto.createSceneSmoke  = function(){
        //-- 开启雾化效果
        LayaAir3D.scene.enableFog = true;
        //-- 设置雾化的颜色
        LayaAir3D.scene.fogColor = new Laya.Vector3(0.53,0.53,0.53);
        //-- 设置雾化的起始位置，相对于相机的距离
        LayaAir3D.scene.fogStart = 4;
        //-- 设置雾化最浓处的距离。
        LayaAir3D.scene.fogRange = 18;


    }  

    /*创建unity3D球角色*/
    _proto.createBall  = function(){
        
        //-- 实例化加载并创建好的3D对象
        LayaAir3D.unity3D = Laya.loader.getRes("res/LayaScene_ball/ball.lh");
        LayaAir3D.scene.addChild(LayaAir3D.unity3D);
        
     

        //-- 克隆一个镜像来伪造旋转
        var ballSp = LayaAir3D.unity3D.clone(); 
        LayaAir3D.ballSp =  ballSp.getChildByName("ball01");
       
        //-- 挂上镜像
        LayaAir3D.ball =  LayaAir3D.unity3D.getChildByName("ball01");
        LayaAir3D.ball.addChild(LayaAir3D.ballSp);
        // console.log(LayaAir3D.ball.getComponentByType(Laya.Rigidbody))
        
        //-- 球皮肤
        var skinBallNow = lx.getStorageSync("skinBallNow");
        var skinBallThe = "";
        if(skinBallNow){
            skinBallThe = skinBallNow; 
        }else{
            skinBallThe = Config.skinBallNow;
        }
        lx.setStorageSync("skinBallNow",skinBallThe);

        //-- 包裹层球透明化
        var material = new Laya.StandardMaterial(); 
        material.albedo = new  Laya.Vector4(1.0,1.0,1.0,0); 
        material.renderMode = 5;
        LayaAir3D.ball.meshRender.material = material;
        LayaAir3D.ball.transform.position = new Laya.Vector3(0,0.1,0);

        //-- 镜像球实体化
        var materialSp = new Laya.StandardMaterial();
        materialSp.diffuseTexture = Laya.Texture2D.load("res/ballSkin/" + skinBallThe + ".jpg");
        materialSp.specularColor = new Laya.Vector4(0,0,0,1);
        LayaAir3D.ballSp.meshRender.material = materialSp;
        LayaAir3D.ballSp.transform.position = new Laya.Vector3(0,0.1,0);

        // //-- 包裹层挂上飞行道具
        LayaAir3D.ball.addChild(this.createBallFly());

        //-- 飞行道具加速旋转
        var flyAc =  LayaAir3D.ball.getChildByName("fly").getChildAt(0).getComponentByType(Laya.Animator);
        flyAc.stop();

    }

    /*创建unity3D球上蜻蜓飞行道具*/
    _proto.createBallFly  = function(){
         //-- 飞行3d道具克隆
        var fly3D = Laya.loader.getRes("res/LayaScene_fly/fly.lh");
        var fly3DSp = fly3D.clone(); 
        
        //-- 飞行道具克隆后贴图设位置
        var fly = fly3DSp.getChildByName("fly");
        var flyTop = fly3DSp.getChildByName("fly").getChildByName("joint1").getChildByName("top");
        var flyBot = fly3DSp.getChildByName("fly").getChildByName("bottom");
        fly.transform.rotate( new Laya.Vector3(-20,0,0),false,false);
        fly.transform.position = new Laya.Vector3(0, .1 ,0);
        var flyMaterial = new Laya.StandardMaterial();      
        flyMaterial.diffuseTexture = Laya.Texture2D.load("res/flySkin/fly01.jpg");  
        flyMaterial.albedo = new  Laya.Vector4(1.0,1.0,1.0,0); 
        flyMaterial.renderMode = 5;
        flyTop.meshRender.material = flyMaterial;
        flyBot.meshRender.material = flyMaterial;

        

        //-- 模型一致标识为球自己头上的飞行道具 
        fly.tag = "self";

        return fly3DSp;
    }
    

     /*创建3D摄像机*/
    _proto.createCamera = function(){
        
        //-- 添加照相机
        LayaAir3D.camera =new Laya.Camera(0, 0.1, 50);
        LayaAir3D.camera.transform.translate(new Laya.Vector3(0, 1.6, 1.1),true);
        
        LayaAir3D.camera.transform.rotate(new Laya.Vector3(-40, 0, 0), false, false);
        LayaAir3D.camera.clearColor = null;
        LayaAir3D.scene.addChild(LayaAir3D.camera);


    }

     /*创建3D灯光*/
    _proto.createLight = function(){
        //-- 添加方向光
        this.directionLight = new Laya.DirectionLight();
        this.directionLight.color = new Laya.Vector3(1, 1,1);
        this.directionLight.direction = new Laya.Vector3(0, -20, -10);
        //-- 设置灯光漫反射颜色             
        this.directionLight.diffuseColor = new Laya.Vector3(1,1,1); 
        //-- 灯光的环境色             
        this.directionLight.specularColor  = new Laya.Vector3(0.1,0.1,0.1); 

        LayaAir3D.scene.addChild(this.directionLight);
    }

    /*初始化创建3D台阶*/
    _proto.createStep = function(posY,posZ){
        
        for(var i=0;i<4;i++){
            //-- 从对象池中获取
            var floor = laya.utils.Pool.getItemByClass("floor", Floor); 
            var step = floor.add();          
            floor.setPos(i,0,posY,posZ,true);
            LayaAir3D.scene.addChild(step);
            // floor.addProp();
            LayaAir3D.floorList.push(floor);
            LayaAir3D.dieFloorList.push(step.transform.position)

        }
          
    }

    /*创建3D台阶*/
    _proto.spawnStep = function(posY,posZ){
        
        //-- 从对象池中获取
        var floor = laya.utils.Pool.getItemByClass("floor", Floor); 
        var step = floor.step ? floor.step : floor.add();

        //-- 设置位置
        var i = 0;
        floor.setPos(i,0,posY,posZ,false);
        LayaAir3D.scene.addChild(step);

        //-- 添加板子上的各类道具
        floor.addProp();

        //-- 记录添加过的板子以便销毁
        LayaAir3D.floorList.push(floor);

        //-- 记录添加过的板子的位置以便接上创建
        LayaAir3D.dieFloorList.push(step.transform.position)
      
    }

    /*初始化创建死亡边界*/
    _proto.deathBorder = function(posY,posZ){     
        for(var i=0;i<4;i++){

            //-- 从死亡边界对象池中获取
            var death = laya.utils.Pool.getItemByClass("death", Death); 
            var borderDeath = death.add();
            death.setPos(i,posY,posZ);
            LayaAir3D.deathList.push(death);
            LayaAir3D.dieDeathList.push(borderDeath.transform.position)
            LayaAir3D.scene.addChild(borderDeath);  

        }
        
    }

    /*创建死亡边界*/
    _proto.spawnDeathBorder = function(posY,posZ){     

        //-- 从死亡边界对象池中获取一个
        var death = laya.utils.Pool.getItemByClass("death", Death); 
        var borderDeath = death.borderDeath ? death.borderDeath: death.add();
        var i = 0;
        death.setPos(i,posY,posZ);
        LayaAir3D.deathList.push(death);
        LayaAir3D.dieDeathList.push(borderDeath.transform.position)
        LayaAir3D.scene.addChild(borderDeath);  

        
        
    }

    //-- 创建unity3D阶梯和雪山 
    _proto.createThing = function(){ 
         Laya.loader.create([
            {url:"res/LayaScene_step/step.lh"},
            {url:"res/LayaScene_stepBreak/stepBreak.lh"},
            {url:"res/LayaScene_speedUp/speedUp.lh"},
            {url:"res/LayaScene_speedDn/speedDn.lh"},
            {url:"res/LayaScene_mushRoom/mushRoom.lh"},
            {url:"res/LayaScene_spring/spring.lh"},
            {url:"res/LayaScene_fly/fly.lh"},
        ],
        Laya.Handler.create(this, this.createStep,[-0.12,-1.3]));

        //-- 创建unity3D雪山    
        Laya.loader.create("res/LayaScene_mountain/mountain.lh",Laya.Handler.create(this, this.createCylinder,[0.8,-6, -4]));

       
    }


    /*创建unity3D雪山*/
    _proto.createCylinder  = function(posX,posY,posZ){         
        var cylinderCom,cylinderComRt;
        for(var i=0; i<8; i++){
            
            if(LayaAir3D.cylindepoolList.length >= 30){
                cylinderCom = LayaAir3D.cylindepoolList.shift();
                laya.utils.Pool.recover("cylinder_left", cylinderCom);

                cylinderComRt = LayaAir3D.cylindepoolList.shift();
                laya.utils.Pool.recover("cylinder_right", cylinderComRt);
                
            }
            //-- 左
            cylinderCom = laya.utils.Pool.getItemByClass("cylinder_left", Cylinder);
            !cylinderCom.cylinder && cylinderCom.init(0);
            LayaAir3D.cylindepoolList.push(cylinderCom); 
            LayaAir3D.scene.addChild(cylinderCom.cylinder);
            cylinderCom.setPos(i,-posX,posY,posZ);   
            

            //-- 右
            cylinderComRt = laya.utils.Pool.getItemByClass("cylinder_right", Cylinder);
            !cylinderComRt.cylinder && cylinderComRt.init(1);
            LayaAir3D.cylindepoolList.push(cylinderComRt); 
            LayaAir3D.scene.addChild(cylinderComRt.cylinder);
            cylinderComRt.setPos(i,posX,posY,posZ); 
        }
        
        cylinderCom && (LayaAir3D.cylindeList[0] = cylinderCom.cylinder.transform.position); 
        

        
         
    }

    /*创建unity3D靶子*/   
    _proto.createTarget = function(posY,posZ){

  
        for(var i=1; i<11; i++){         

            var target3D = Laya.loader.getRes("res/LayaScene_target/target.lh");
            var targetSp =target3D.clone(); 
            LayaAir3D.scene.addChild(targetSp);
            
            target = targetSp.getChildByName("target");

            var temp = 0;
            Math.random() > 0.5?temp = 0.6:temp = -0.6;
 
            target.transform.position = new Laya.Vector3(Math.random()*temp ,posY - 4.06*i, posZ -5.2*i); 
            target.transform.rotate( new Laya.Vector3(-20,0,0),false,false);
            

            var material = new Laya.StandardMaterial();      
            material.diffuseTexture = Laya.Texture2D.load("res/targetSkin/target01.jpg"); 
            material.albedo = new  Laya.Vector4(1.0,1.0,1.0,0.8); 
            material.renderMode = 5;
            target.meshRender.material = material;

        }
        



    },



    /*创建戏界面*/ 
    _proto.createView = function(){
        //-- 游戏界面
        Laya.gameView = new GameView();
        Laya.stage.addChild(Laya.gameView);
        LayaAir3D.timered = null;
        
        //-- 引导界面
        Laya.guideView = new GuideView();
        Laya.guideView.visible = false;
        Laya.stage.addChild(Laya.guideView);

        //-- 添加开始界面
        Laya.startView = new StartView();
        Laya.startView.visible = false;
        Laya.stage.addChild(Laya.startView);
        
        //-- 判断是否重开
        var isStart = lx.getStorageSync("isStart");
        var self = this;
        if(isStart != "0" || !isStart){
            Laya.startView.visible = true;
            this.createTween();
            clearInterval(LayaAir3D.timered)
            LayaAir3D.timered = setInterval(function(){
                self.createTween();   
            },5000)
             
        }else{
            Laya.startView.visible = false;
            LayaAir3D.ball.addComponent(BallScript);

            lx.setStorageSync("isStart","1");
        }


        //-- 复活币设置
        var reliveCoins = lx.getStorageSync("reliveCoins");
        var reliveCoinsdata = {"reliveCoins":0,"istake":"true"};
        if(!reliveCoins){
             lx.setStorageSync("reliveCoins",reliveCoinsdata )
        }

        //-- 奖励语设置
        var ballNameCfg = lx.getStorageSync("ballNameCfg");
        if(!ballNameCfg){
             lx.setStorageSync("ballNameCfg",Config.ballNameCfg)
        }

        //-- 结束界面
        Laya.gameOver = new GameOver();
        Laya.gameOver.visible = false;
        Laya.stage.addChild(Laya.gameOver);

        //-- 主排行榜返回界面   
        Laya.rankViewMain = new RankViewMain();
        Laya.rankViewMain.visible = false;
      	Laya.stage.addChild(Laya.rankViewMain);

        
        
    }



    /*监听事件*/
    _proto.addlisten  = function(){

        
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    /*关闭监听事件*/
    _proto.offAddlisten  = function(){
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    /*鼠标按下*/
    _proto.onMouseDown = function(e){         
        this.baseClickX = e.stageX;


    }
    
    /*鼠标抬起*/
    _proto.onMouseUp = function(e){    
        
    }

    /*鼠标移动*/
    _proto.onMouseMove = function(e){  

        LayaAir3D.ballPosX = LayaAir3D.ball.transform.position.x;
        var detax = e.stageX - this.baseClickX;
        var limit = 0.6;
        if(detax>0){
            if( LayaAir3D.ballPosX > limit){
                LayaAir3D.ball.transform.position.x = limit;
                return;
            }
            
        }else{
             if( LayaAir3D.ballPosX < -limit ){
                LayaAir3D.ball.transform.position.x = -limit;

                return;
            }

        }
        LayaAir3D.ball.transform.translate(new Laya.Vector3(detax/500,0, 0), false);

        //-- 记录上次触摸的位置
        this.baseClickX = e.stageX;

    }
    
      
    /**
     * 重力感应
     */
    _proto.onDeviceorientation = function(absolute, rotationInfo) {

        var instacne = 0.01;
        var limit = 0.45;
        var ballPosX = LayaAir3D.ball.transform.position.x;
        // LayaAir3D.info.text =  "gamma:" +  rotationInfo.x ;


        if(ballPosX > limit){
            LayaAir3D.ball.transform.position.x = limit
        }else  if(ballPosX < -limit){
            LayaAir3D.ball.transform.position.x = -limit
        }   

        LayaAir3D.ball.transform.translate(new Laya.Vector3(instacne*rotationInfo.x,0, 0), false);

    }


    return LayaAir3D;
} ());

 new LayaAir3D;


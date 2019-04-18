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
        //获取球体位置
        this.ball = this.owner;
        // console.log(this.ball )

        this.camera = LayaAir3D.camera;
        this.id = Math.random();
        
        this.dieFloorList = LayaAir3D.dieFloorList;
        this.cylindeList = LayaAir3D.cylindeList;
        
        //-- 初始小球速度
        this.speedZ = -0.08;

        //-- 初始小球重力
        this.garvatiy = -0.12;

        //-- 初始相机重力
        this.garvatiyCa = -0.12;

        //-- 持续远动开关
        this.keepFlag = false;

        //-- 重力系统开关
        this.fallFlag = false;

        this.pengFlag = true;
        this.duration = 5;


        this.lastStamp = 0;


        //-- 滚动开关
        this.maskFlag = false;
        
        this.speedUpFlag = true;
        this.speedDnFlag = true;
        this.mushFlag = false;

        this.jumpFlag = false;

        this.speedUpZ =  this.speedDnZ = -0.08;
        this.speedGa = 0;
        this.jumpSpeedY = 0.1;
        this.ball.transform.translate(new Laya.Vector3(0,-0.1 ,0), false);

        //-- 分数
        this.score = Laya.gameView.score.text;
        this.scoreFlag = true;
        

        //-- 球的旋转角度
        this.ballRoate = -15;

        //-- 弹簧第三个超级跳跃计数
        this.jumpTimes = 0;
        this.jumpNums = 3;

        //-- 加速带第三个超级跳跃计数
        this.speedTimes = 0
        this.speedNums = 3;
    }
    
   _proto._update = function (owner) {

        //-- 持续向前运动
        this.onkeep();

        //-- 重力系统
        this.onFall();

        //-- 动态检测并创建元素
        this.onFrameLoop();
        
        if(Laya.gameOver.visible ) return
        Laya.gameView.score.text = Number(Laya.gameView.score.text)  + 1;
    }

    /*台阶回收后再取出创建*/
    _proto.onFrameLoop  = function(){  
        //-- 球旋转 
        LayaAir3D.ball.transform.rotate( new Laya.Vector3(this.ballRoate,0,0),false,false);
        // console.log(this.ball.transform.position.z,LayaAir3D.dieFloorList[LayaAir3D.dieFloorList.length -1].z  )
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


    /**
     * 当其他碰撞器进入绑定物体碰撞器时触发（球体碰到台阶时）
     * 注：如相对移动速度过快，可能直接越过
     */
    _proto.onTriggerEnter = function (other) {
        // this.garvatiy = 0;

        // //-- 初始相机重力
        // this.garvatiyCa = 0;
        if(typeof Laya.stage._childs[1] != "undefined"){
            Laya.stage._childs[1].text = Number(Laya.stage._childs[1].text) + 1 
        }
        var target = other.owner.name;
  
        if( target == "paodao" && Config.isStart){
            //-- 跑道碰撞开始函数
            this.beginFunPaodao(other);
           
        }else if(target == "jiasu"){

            this.beginFunJiasu(other);
                     
        }else if(target == "jiansu"){
            // console.log("碰撞减速带开始");
            this.beginFunJiansu(other)
            

        }else if(target == "mushroom"){
            var self = this;
            var timer1 =   setTimeout(function(){
                
               other.owner&&( other.owner.destroy());
            },20);
            this.timer2 && clearTimeout(this.timer2);
            
            if(other.owner.theName == "mushRoomRed"){
               
                // console.log("碰撞红蘑菇");
                this.ball.transform.scale = new Laya.Vector3(1.5, 1.5, 1.5);
                this.ball.transform.translate(new Laya.Vector3(0, 0.1, 0),false);
                this.camera.transform.translate(new Laya.Vector3(0, 0.1, 0),false);
            }else if(other.owner.theName == "mushRoomGn"){
                // console.log("碰撞绿蘑菇");
                this.ball.transform.scale = new Laya.Vector3(0.5, 0.5, 0.5); 
            }
            
            this.timer2 =setTimeout(function(){
                self.ball.transform.scale = new Laya.Vector3(1, 1, 1);
                // self.ball.transform.translate(new Laya.Vector3(0, 0, 0),false);
            },2000);

            
            
        }else if( target == "tiaoyue"){
            this.beginFunTiaoyue(other);
          
            
        }else if( target == "death"){
            this.beginFunDeath(other);
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
        
        if( target == "paodao"){
            //-- 重力开启
            this.fallFlag = false;
            // console.log("碰撞结束");

            if(other.owner.coliobj.tag == 0){

                other.owner.coliobj.tag = 1;
            }

            
            // Laya.timer.loop(this.duration , this, this.onLoop);

        }else if(target == "jiasu"){
            // console.log("碰撞加速带结束");
            // var self = this;
            // setTimeout(function(){
            //     self.maskFlag = false;
            //     self.speedUpFlag = true;
            //     self.speedUpZ = -0.08;
            //     self.speedGa = 0;
            // },1660)



        }else if(target == "jiansu"){
            // console.log("碰撞减速带结束");
            // var self = this;
            // setTimeout(function(){
            //     self.maskFlag = false;
            //     self.speedDnFlag = true;
            //     self.speedDnZ = -0.04;
            //     self.speedZ = - 0.06;
            //     // self.garvatiyCa =self.garvatiy = -0.2;
            // },200)
            
        }else if( target == "tiaoyue"){
            // var self = this;
            
            // setTimeout(function(){
            //     self.maskFlag = false;
            //     self.jumpFlag = true;
            //     self.jumpSpeedY = 0;

            //     self.garvatiyCa = self.garvatiy = 0;
            //     self.speedZ = -0.08;
            // },600)

            // setTimeout(function(){
       
            //     self.speedZ = - 0.12;
            //     self.garvatiyCa =self.garvatiy = -0.24;
            // },750)

        }


    }

    /**
     * 跑道碰撞开始函数
     */
    _proto.beginFunPaodao = function(other){
        console.log("碰撞跑道开始");
        //-- 重力关闭
        this.fallFlag = true;

        // this.garvatiyCa = this.garvatiy = 0;

        this.ballRoate = -15;
        //-- 解决穿透问题
        var yDis = this.ball.getComponentByType(Laya.SphereCollider).radius + other.owner.getComponentByType(Laya.BoxCollider).size.y/2
        var yPos =this.ball.transform.position.y - other.owner.transform.position.y ;

        if(yPos <0.5){
            // this.camera.transform.translate(new Laya.Vector3(0,0.1,0), false);
            // this.ball.transform.translate(new Laya.Vector3(0,0.1,0), false);
            
        }


        this.pengFlag = true;
        // Laya.timer.loop(this.duration , this, this.onLoop);

    }

    /**
     * 加速带碰撞开始函数
     */
    _proto.beginFunJiasu= function(other){
        console.log("碰撞加速带开始");
        this.speedZ += -0.01;
        this.garvatiy += -0.01;
         this.garvatiyCa  +=-0.01;
        

        this.maskFlag = true;
        this.speedUpFlag = false;
        this.ballRoate = -30;

        this.speedTimes++;

        //-- 配置第几个为超级跳跃
        if(this.speedTimes == this.speedNums){
            this.speedTimes = 0;
            // this.speedGa = -0.1;
            this.speedUpZ = -0.12
            console.log("第" + this.speedNums + "个");
        }
        
        // Laya.timer.loop(this.duration , this, this.onSpeedUp);
    }

    /**
     * 减速带碰撞开始函数
     */
    _proto.beginFunJiansu= function(other){
        this.speedZ -= -0.01
        this.garvatiy += 0.01;
        this.garvatiyCa  +=0.01;



        this.maskFlag = true;
        this.speedDnFlag = false;
        this.ballRoate = -10;

        // Laya.timer.loop(this.duration , this, this.onSpeedDn);
        // lx.config.platform == "weixin"
        if(Laya.Browser.onWeiXin){
            lx.vibrateLong();
        }
    }

     /**
     * 跳跃带碰撞开始函数
     */
    _proto.beginFunTiaoyue = function(other){
        this.maskFlag = true;
        this.jumpFlag = false;

        this.jumpTimes++;

        //-- 配置第几个为超级跳跃
        if(this.jumpTimes == this.jumpNums){
            this.jumpTimes = 0;
            this.jumpSpeedY = 0.12;
        }
        Laya.timer.loop(this.duration , this, this.onJump);
    }

    /**
     * 死亡边界碰撞开始函数
     */
    _proto.beginFunDeath = function(other){
        console.log("碰到死亡边界")
        var self = this;
        // this.maskFlag = true;
        this.speedZ = 0;
        this.garvatiyCa = 0;
        this.garvatiy -= 0.01;

        setTimeout(function(){
            Laya.gameOver.visible = true;
            Laya.gameOver.endScore.text = "最终得分："  + Laya.gameView.score.text;

            if(Laya.Browser.onWeiXin){
                lx.postMessage({
                    message: JSON.stringify({tag:"postUserScore", data:{score: Laya.gameView.score.text}})
                });
            }
            

            var highScore =  lx.getStorageSync("highScore");

            if(!highScore){
                Laya.gameOver.hisScore.text = "历史最高分：0";
                lx.setStorageSync("highScore",Laya.gameView.score.text);
            }else{           
                if( Number( highScore) < Number(Laya.gameView.score.text )){
                    lx.setStorageSync("highScore",Laya.gameView.score.text);  
                }
                Laya.gameOver.hisScore.text = "历史最高分：" + highScore
            }

            if(Laya.Browser.onWeiXin){
                lx.postMessage({
                    message: JSON.stringify({tag:"getUserScore"})
                });
                LayaAir3D.prototype.showRank("getSmallRankList");
            }
        },600)

        

        

    }

    /**
     * 球相机运动变化
     */
     _proto.onChange = function(x,y,z){
        this.camera.transform.translate(new Laya.Vector3(x,y,z), false);
        this.ball.transform.translate(new Laya.Vector3(x,y,z), false);
     }

     /**
     * 保持性向前运动状态
     */
     _proto.onkeep = function(){
         console.log(this.speedZ)
        if(!this.keepFlag){
            this.onChange(0,0,this.speedZ);

        }
     
    }

     /**
     * 重力系统
     */
     _proto.onFall = function(){
        if(!this.fallFlag){
            // this.garvatiyCa -= 0.006;
            // this.garvatiy -= 0.006;
            this.camera.transform.translate(new Laya.Vector3(0, this.garvatiyCa,0), false);
            this.ball.transform.translate(new Laya.Vector3(0, this.garvatiy,0), false);

        }
     
    }


    /**
     * 碰到阶梯状态
     */
     _proto.onLoop = function(){
         if(!this.maskFlag){
             this.camera.transform.translate(new Laya.Vector3(0, this.garvatiyCa, this.speedZ), false);
             this.ball.transform.translate(new Laya.Vector3(0, this.garvatiy,this.speedZ), false);
            // this.ball.getComponentByType(Laya.Rigidbody).velocity = new Laya.Vector3(0, 0, 50);
        }
         

    }

    /**
     * 加速状态
     */
     _proto.onSpeedUp = function(){
        if(!this.speedUpFlag){
            this.speedGa -= 0.002;
            this.speedUpZ -= 0.001
            this.camera.transform.translate(new Laya.Vector3(0, this.speedGa ,  this.speedUpZ), false);
            this.ball.transform.translate(new Laya.Vector3(0, this.speedGa , this.speedUpZ), false);
        }

    }

    /**
     * 减速状态
     */
    _proto.onSpeedDn= function(){
        if(!this.speedDnFlag){
            
            this.speedDnZ += 0.001;
            this.camera.transform.translate(new Laya.Vector3(0, 0,  this.speedDnZ), false);
            this.ball.transform.translate(new Laya.Vector3(0, 0, this.speedDnZ), false);
        }
        
    }

    /**
     * 跳跃状态
     */
    _proto.onJump= function(){
        if(!this.jumpFlag){
            this.jumpSpeedY += 0.009;
            this.camera.transform.translate(new Laya.Vector3(0,this.jumpSpeedY,0), false);
            this.ball.transform.translate(new Laya.Vector3(0,this.jumpSpeedY,0), false);

        }
        
    }



    

    return BallScript;
})(Laya.Script);

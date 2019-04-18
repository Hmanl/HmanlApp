(function(){
    
    /**
     * 台阶类
     */
    function Floor(){
        
        
		Floor.__super.call(this);
        this.step = null;

    }
    
    

	//Floor 是一个显示对象 继承此 Sprite
	Laya.class(Floor, "Floor", laya.display.Sprite);
    
    var _proto = Floor.prototype;

    /*生成台阶*/
    _proto.add = function(){
    
        var step3D = Laya.loader.getRes("res/LayaScene_step/step.lh");
        var stepSp = step3D.clone(); 
        LayaAir3D.scene.addChild(stepSp);
        this.step = stepSp.getChildByName("paodao");
        this.step.floor = this;


        var ico = "";
        var  random = Math.random()
        if(random>0 && random<0.3){
            ico = "lvse"
        }else if(random>0.3 && random<0.6){
            ico = "zise"
        }else{
            ico = "star"
        }

        var material = new Laya.StandardMaterial();      
        material.diffuseTexture = Laya.Texture2D.load("res/stepSkin/"+ ico +".jpg");  
        this.step.meshRender.material = material;
        
        
        
         this.step.coliobj = {"tag": 0}
 
        return  this.step;

        
       
    }
    
    //-- 板子上的物件
    _proto.addProp = function(){
        //-- 清除所有道具
        this.step.removeChildren();

        //-- 生成加速带-带减速带-跳跃带
        this.speedTool();

        //-- 生成变大道具-变小道具
        this.changeTool();     
        
        
        
        
        //-- 生成副板子
        var random =Math.random()
        if(random>0 && random<0.1){      
            this.stepSonTool(0);
            this.stepSonTool(1);
        }
        
  


     }

     /*设置台阶位置*/       
     _proto.setPos = function(i,posX, posY,posZ,flag){
        var ranX = 0;
        var rang = 0.3;

        if(flag){
            if( i <= 1){
                ranX = 0;
            }else{
                Math.random()*1 > 0.5?  ranX = Math.random()*rang : ranX = -Math.random()*rang;
            }
            
            this.step.transform.position = new Laya.Vector3( 0,posY-i*4, posZ-i*5.1);
        }else{
            Math.random()*1 > 0.5?  ranX = Math.random()*rang : ranX = -Math.random()*rang;   
            
            this.step.transform.position = new Laya.Vector3( ranX,posY, posZ);
        }

        this.step.coliobj = {"tag": 0}
               
     }

    /*生成加速带-带减速带-跳跃带*/ 
    _proto.speedTool = function(){
        //-- 加速带
        var speedUp3D = Laya.loader.getRes("res/LayaScene_speedUp/speedUp.lh");
        var speedUpSp = speedUp3D.clone();          
        var jiasu = speedUpSp.getChildByName("jiasu");
        jiasu.transform.position = new Laya.Vector3(0,0.1,-0.7)

        //-- 减速带
        var speedDn3D = Laya.loader.getRes("res/LayaScene_speedDn/speedDn.lh");
        var speedDnSp = speedDn3D.clone();        
        var jiansu = speedDnSp.getChildByName("jiansu");
        jiansu.transform.position = new Laya.Vector3(0, 0.1,-0.7);

        //-- 跳跃带 
        var spring3D = Laya.loader.getRes("res/LayaScene_spring/spring.lh");
        var springSp = spring3D.clone();        
        var tiaoyue = springSp.getChildByName("tiaoyue");
        tiaoyue.transform.position = new Laya.Vector3(0, 0.01,-1.2);

        var random1 = Math.random();
        var random2 = Math.random();
        if(random1>0.02 && random1<0.22){
            this.step.addChild( speedUpSp);
        }else if(random1>0.22 && random1<0.32){ 
            random2 < 0.5 ? this.step.addChild(springSp) : this.step.addChild(speedDnSp);

        }else if(random1>0 && random1<0.01){
            //-- 生成飞行道具
            this.flyTool();
        }
 
    }   

    
    /*生成变大道具-变小道具*/ 
    _proto.changeTool = function(){
        //-- 红蘑菇 
        var mash3D = Laya.loader.getRes("res/LayaScene_mushRoom/mushRoom.lh");
        var mashRed3DSp = mash3D.clone();        
        var mushRoomRed = mashRed3DSp.getChildByName("mushroom");
        mushRoomRed.transform.position = new Laya.Vector3(0, 0.06, -0.3)
        var mushMaterial = new Laya.StandardMaterial();      
        mushMaterial.diffuseTexture = Laya.Texture2D.load("res/mashSkin/mushroom.jpg"); 
        mushMaterial.specularColor = new Laya.Vector4(0,0,0,1); 
        mushRoomRed.meshRender.material = mushMaterial;
        mushRoomRed.theName = "mushRoomRed";
        mushRoomRed.transform.rotate( new Laya.Vector3(-30,0,0),false,false);
        mushRoomRed.transform.scale = new Laya.Vector3(1.5, 1.5, 1.5);

        //-- 绿蘑菇 
        var mashGn3DSp = mash3D.clone();        
        var mushRoomGn = mashGn3DSp.getChildByName("mushroom");
        mushRoomGn.transform.position = new Laya.Vector3(0, 0.06, -0.3);
        var mushMaterial2 = new Laya.StandardMaterial();      
        mushMaterial2.diffuseTexture = Laya.Texture2D.load("res/mashSkin/mushroom_G.jpg");  
        mushMaterial2.specularColor = new Laya.Vector4(0,0,0,1);
        mushRoomGn.meshRender.material = mushMaterial2; 
        mushRoomGn.theName = "mushRoomGn";
        mushRoomGn.transform.rotate( new Laya.Vector3(-30,0,0),false,false);
        mushRoomGn.transform.scale = new Laya.Vector3(1.5, 1.5, 1.5);

        var random3 = Math.random();

        if(random3>0.65 && random3<0.68){
            this.step.addChild(mashRed3DSp)
        }else if(random3>0.7 && random3<0.73){
            this.step.addChild(mashGn3DSp)
        }
       
    }

    /*生成飞行道具*/ 
    _proto.flyTool = function(){
        //-- 无人机
        var fly3D = Laya.loader.getRes("res/LayaScene_fly/fly.lh");
        var fly3DSp = fly3D.clone();  
        var fly = fly3DSp.getChildByName("fly");
        var flyTop = fly3DSp.getChildByName("fly").getChildByName("joint1").getChildByName("top");
        var flyBot = fly3DSp.getChildByName("fly").getChildByName("bottom");

        fly.transform.position = new Laya.Vector3(0, 0.1,-0.9);
        var flyMaterial = new Laya.StandardMaterial();      
        flyMaterial.diffuseTexture = Laya.Texture2D.load("res/flySkin/fly01.jpg");  
        flyTop.meshRender.material = flyMaterial;
        flyBot.meshRender.material = flyMaterial;
        fly.tag = "tool";

        
        this.step.addChild(fly3DSp)
        var flyTheAc = fly3DSp.getChildAt(0).getComponentByType(Laya.Animator);
        flyTheAc.stop();

    }
    
    /*生成副板子*/ 
    _proto.stepSonTool = function(num){
        var stepSon3dArr = ["res/LayaScene_step/step.lh","res/LayaScene_stepBreak/stepBreak.lh"];
        var index = 0;
        var stepPosRang = 0
        var stepPosX = this.step.transform.position.x;
        
        Math.random() < 0.3 ? index = 0: index = 1;

        var stepSon3D = Laya.loader.getRes(stepSon3dArr[index]);
        var stepSonSp = stepSon3D.clone();       
        var stepSon = stepSonSp.getChildAt(0);

        
        if(stepPosX>=-0.3 && stepPosX <= -0.1){
            num == 0 ? stepPosRang = 0.6:stepPosRang = 1.2;
        }else if(stepPosX>-0.1  && stepPosX <= 0.1){
            num == 0 ? stepPosRang = -0.6:stepPosRang = 0.6;
        }else{
            num == 0 ? stepPosRang = -0.6:stepPosRang = -1.2;
        }
        
        stepSon.transform.position = new Laya.Vector3(stepPosRang, 0, 0);   


        switch(stepSon.name){
            case "paodao":
                this.paodaoSon(stepSon);
                break;
            case "paodao_break":
                this.paodao_breakSon(stepSon);
                break;
        }

               
    }

    /*生成正常副板子*/ 
    _proto.paodaoSon = function(target){
        var ico = "";
        var  random = Math.random()
        if(random>0 && random<0.3){
            ico = "lvse"
        }else if(random>0.3 && random<0.6){
            ico = "zise"
        }else{
            ico = "star"
        }
        // var longRang = 0.6

        // Math.random()>0.5 ? longRang = 0.6 : longRang = 1
    
        // target.transform.scale = new Laya.Vector3(1,1, longRang);

        var material = new Laya.StandardMaterial();      
        material.diffuseTexture = Laya.Texture2D.load("res/stepSkin/"+ ico +".jpg");  
        target.meshRender.material = material;
        this.step.addChild(target);
    }

    /*生成碎板子副板子*/ 
    _proto.paodao_breakSon = function(target){
        var ico = "";
        var  random = Math.random()
        if(random>0 && random<0.3){
            ico = "lvse_break"
        }else if(random>0.3 && random<0.6){
            ico = "zise_break"
        }else{
            ico = "star_break"
        }


        var material = new Laya.StandardMaterial();      
        material.diffuseTexture = Laya.Texture2D.load("res/stepSkin/"+ ico +".jpg");  
        for(var j=0; j<target._childs.length;j++){
            target._childs[j]._childs[0].meshRender.material = material;
        }
        this.step.addChild(target);

        //-- 暂停动画
        var stepBreak3DAc = target.getComponentByType(Laya.Animator);
     
        stepBreak3DAc.stop();
 

    }

})();
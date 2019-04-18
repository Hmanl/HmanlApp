(function(){
    
    /**
     * 圆柱
     */
    function Cylinder(){

		Cylinder.__super.call(this);
        this.cylinder = null;
    }
    
    

	//Cylinder 是一个显示对象 继承此 Sprite
	Laya.class(Cylinder, "Cylinder", laya.display.Sprite);
    
    var _proto = Cylinder.prototype;

    /*圆柱初始化*/  
    _proto.init = function(dir){
 
        var mount3D = Laya.loader.getRes("res/LayaScene_mountain/mountain.lh");
        var sp = mount3D.clone(); 
        LayaAir3D.scene.addChild(sp);
        this.cylinder = sp.getChildByName("pillar");
        this.cylinder.transform.scale = new Laya.Vector3(1,1 + Math.random()*2 , 1);
        if(dir == 0){
            this.cylinder.transform.rotate(new Laya.Vector3(20, 0, 10), false, false);
        }else{
            this.cylinder.transform.rotate(new Laya.Vector3(20, 0, -10), false, false);
        }
    }

    /*设置圆柱位置*/     
    _proto.setPos = function(i,posX, posY,posZ){
         this.cylinder.transform.position =new Laya.Vector3(posX,posY - i *3.166666,posZ - i *4);
    }

})();
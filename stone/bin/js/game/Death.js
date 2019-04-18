(function(){
    
    /**
     * 台阶类
     */
    function Death(){
        
        
		Death.__super.call(this);
        this.border = null;

    }
    
    

	//Death 是一个显示对象 继承此 Sprite
	Laya.class(Death, "Death", laya.display.Sprite);
    
    var _proto = Death.prototype;

    /*生成Death边界*/
    _proto.add = function(){
        //-- 正方体
        this.borderDeath = new Laya.MeshSprite3D(new Laya.BoxMesh(8, 8, 1));

        //-- 透明材质
        var material = new Laya.StandardMaterial(); 
        material.albedo = new  Laya.Vector4(1.0,1.0,1.0,0);
        material.renderMode = 5;
        this.borderDeath .meshRender.material = material;

        var boxCollider = this.borderDeath.addComponent(Laya.BoxCollider);
        boxCollider.setFromBoundBox(this.borderDeath.meshFilter.sharedMesh.boundingBox);
        boxCollider.owner.name = "death"
   

        return  this.borderDeath;

        
       
    }
    
    


   

     /*设置台阶位置*/       
    _proto.setPos = function(i,posY,posZ){     
        this.borderDeath.transform.position = new Laya.Vector3( 0,posY-i*4, posZ-i*5.1);           
    }

})();
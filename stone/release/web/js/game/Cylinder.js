!function(){function a(){a.__super.call(this),this.cylinder=null}Laya.class(a,"Cylinder",laya.display.Sprite);var n=a.prototype;n.init=function(a){var n=Laya.loader.getRes("res/LayaScene_mountain/mountain.lh").clone();LayaAir3D.scene.addChild(n),this.cylinder=n.getChildByName("pillar"),this.cylinder.transform.scale=new Laya.Vector3(1,1+2*Math.random(),1),0==a?this.cylinder.transform.rotate(new Laya.Vector3(20,0,10),!1,!1):this.cylinder.transform.rotate(new Laya.Vector3(20,0,-10),!1,!1)},n.setPos=function(a,n,t,e){this.cylinder.transform.position=new Laya.Vector3(n,t-3.166666*a,e-4*a)}}();
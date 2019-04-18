(function () {
	
	/**
	 * 引导页面
	 */
	function GuideView(){

		GuideView.__super.call(this);
		this.init();
	}
	//GuideView
	Laya.class(GuideView,"GuideView", guideViewUI);
	
	var _proto = GuideView.prototype;
	
	_proto.init = function(){


		//创建动画实例
		this.guideSke = new Laya.Skeleton();
		//加载动画图集，加载成功后执行回调方法
		this.guideSke.load("res/spine/guide.sk",Laya.Handler.create(this,this.onLoaded));
		
		this.theMask.on(Laya.Event.MOUSE_DOWN, this, this.onTouchDown);
		//遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});

	}

	_proto.onLoaded = function(){
		this.guideAniBox.addChild(this.guideSke );	
	
	}
	_proto.onTouchDown = function(){
		this.visible = false;
		LayaAir3D.ball.addComponent(BallScript);

	}
	
})();

























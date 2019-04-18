(function () {
	
	/**
	 * 游戏结束
	 */
	function GameOver(){

		GameOver.__super.call(this);
		this.init();
	}
	//GameOver
	Laya.class(GameOver,"GameOver", gameOverViewUI);
	
	var _proto = GameOver.prototype;
	
	_proto.init = function(){
		
		Config.scaleBtn(this.againBtn,this.againGame);
		Config.scaleBtn(this.shareBtn,this.shareGame);
		Config.scaleBtn(this.skinBtn,this.skinShow);
		Config.scaleBtn(this.backBtn,this.backGame);
		Config.scaleBtn(this.tellBtn,this.tellGame);

		//遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});

		
	}

	/*游戏重开*/
    _proto.againGame = function(){ 
		LayaAir3D.prototype.hideRank("closeSmallRankView"); 
		console.log("游戏重开")
		lx.setStorageSync("isStart","0");
		LayaAir3D.ball.removeComponentsByType(BallScript);
		LayaAir3D.ball.removeChildren();
		LayaAir3D.scene.removeChildren();
		LayaAir3D.scene.destroy(true);
		LayaAir3D.ball.acName = ""
		Laya.stage.removeChildren();
		LayaAir3D.ball.transform.scale = new Laya.Vector3(1, 1, 1);
		LayaAir3D.prototype.on3DComplete();
		
		Laya.timer.once(5000, this, function(){
			Laya.gameView.guideAniBox.destroy()
		});

    }

	/*游戏返回开始界面*/
    _proto.backGame = function(){  
		LayaAir3D.prototype.hideRank("closeSmallRankView"); 
		console.log("游戏返回开始界面")
		LayaAir3D.ball.removeComponentsByType(BallScript);
		LayaAir3D.ball.removeChildren();
		LayaAir3D.scene.removeChildren();
		LayaAir3D.scene.destroy(true);
		LayaAir3D.ball.transform.scale = new Laya.Vector3(1, 1, 1);
		Laya.stage.removeChildren();
		LayaAir3D.prototype.on3DComplete();
		clearInterval(LayaAir3D.timered);
    }

	/*游戏分享*/
    _proto.shareGame = function(){ 
		lx.shareAppMessage({
			"title" : "球你滚吧！真的球你滚吧！！拉上好友一起滚球！！！",
			"imageUrl" : "http://h5.lexun.com/games/wx/ballrun/res/rank/icon.jpg",
		})

    }

	/*进入皮肤商城*/
  	_proto.skinShow = function(){
		Laya.skinView = new SkinView();  
        Laya.stage.addChild(Laya.skinView);
	}
  
	/*炫耀分享*/
    _proto.tellGame = function(){ 
		var myInfo = lx.getStorageSync("myInfo");

		var myScore = 0;
        if(myInfo){
             myScore = myInfo.myScore;
        }else{
			 myScore = 0;
		}

		lx.shareAppMessage({
			"title" : "我刚刚在这个游戏获得" + myScore + "分！快来挑战我吧！！！",
			"imageUrl" : "http://h5.lexun.com/games/wx/ballrun/res/rank/icon.jpg",
		})

    }
	
})();

























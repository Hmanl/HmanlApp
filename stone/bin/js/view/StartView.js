(function () {
	
	/**
	 * 游戏开始界面
	 */
	function StartView(){
		StartView.__super.call(this);
		this.init();
	}

	Laya.class(StartView,"StartView",startViewUI);
	
	var _proto = StartView.prototype;
	
	_proto.init = function(){
		//-- 游戏开始按钮
		Config.scaleBtn(this.startBtn,this.startGame,this)

		//-- 排行榜的按钮
		Config.scaleBtn(this.rankingsBtn,this.rankingsShow,this);
		
		//-- 首页皮肤按钮
		Config.scaleBtn(this.skinBtn,this.skinShow,this);

		//-- 推荐游戏按钮
		Config.scaleBtn(this.gameIcoBtn,this.gameShow,this);

		//-- 更多游戏按钮
		Config.scaleBtn(this.lajiBoxBtn,this.boxShow,this);

		//-- 复活礼包按钮
		Config.scaleBtn(this.reliveGiftBtn,this.giftShow,this);


		this.theTip1.visible =true;
		this.theTip2.visible =false;
		this.theTip3.visible =false;


		//遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});

		if(Laya.Browser.onWeiXin){
			this.gameIcoBtn.visible =false;
			this.lajiBoxBtn.visible =true;
		}

	}

	/*游戏开始*/
  	_proto.startGame = function(self){         
		console.log("游戏开始");
		self.removeSelf();
		Config.isStart = true;
		Laya.guideView.visible = true;
		

  	}
	
	/*排行榜展示*/
 	_proto.rankingsShow = function(){   
		console.log("排行榜展示");
		lx.postMessage({
				message: JSON.stringify({tag:"getUserScore"})
		});
		//发消息到开放域，显示总排行榜
		LayaAir3D.prototype.showRank("getRankList");
		
		Laya.rankViewMain.visible = true;
  	}

	/*进入推荐游戏*/
  	_proto.gameShow = function(){
		lx.navigateToMiniProgram({
            appId:'wxe8a45bddfbf0b97b',
        });
	}

	/*进入游戏盒子*/
  	_proto.boxShow = function(){
		lx.navigateToMiniProgram({
            appId:'wxf925857e2463adc5',
        });
	}

	/*进入皮肤商城*/
  	_proto.skinShow = function(){
	
		Laya.skinView = new SkinView();  
        Laya.stage.addChild(Laya.skinView);
	}
	
	/*领取复活币*/	
  	_proto.giftShow = function(self){
		//-- 复活币设置
		// var self = this
        var reliveCoinsData = lx.getStorageSync("reliveCoins");

		// console.log(reliveCoinsData)
		if(reliveCoinsData.istake){	
			reliveCoinsdata = {"reliveCoins":Number(reliveCoinsData.reliveCoins)  + 2,"istake":false};
			lx.setStorageSync("reliveCoins",reliveCoinsdata);

			self.theTip1.visible =false;
			self.theTip2.visible =true;
			self.theTip3.visible =false;
		}else{
			lx.shareAppMessage({
				"title" : "球你滚吧！真的球你滚吧！！拉上好友一起滚球！！！",
				"imageUrl" : "http://h5.lexun.com/games/wx/ballrun/res/rank/icon.jpg",
				success : function(res){
					reliveCoinsdata = {"reliveCoins":Number(reliveCoinsData.reliveCoins)  + 1,"istake":false};
					lx.setStorageSync("reliveCoins",reliveCoinsdata);
					self.theTip1.visible =false;
					self.theTip2.visible =false;
					self.theTip3.visible =true;
				}
			})

		}

		
 
	}

})();

























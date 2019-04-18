(function () {
	
	/**
	 * 游戏结束
	 */
	function RankViewMain(){

		RankViewMain.__super.call(this);
		this.init();
	}
	//RankViewMain
	Laya.class(RankViewMain,"RankViewMain", rankViewUI);
	
	var _proto = RankViewMain.prototype;
	
	_proto.init = function(){
		Config.scaleBtn(this.backBtn,this.closeRank);

		//遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});

	}

	/*游戏开始*/
  _proto.closeRank = function(){  
	   console.log("关闭排行榜")       
	   LayaAir3D.prototype.hideRank("closeRankView"); 
	   Laya.rankViewMain.visible = false;
  }


	

	
	
	
})();

























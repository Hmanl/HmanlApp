(function () {
	
	/**
	 * 游戏结束
	 */
	function RankView(){

		RankView.__super.call(this);
		this.init();
	}
	//RankView
	Laya.class(RankView,"RankView", rankViewUI);
	
	var _proto = RankView.prototype;
	
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
	   Laya.rankView.visible = false;
  }


	

	
	
	
})();

























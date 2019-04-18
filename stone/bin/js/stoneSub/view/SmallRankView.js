(function () {
	
	/**
	 * 小排行榜列表
	 */
	function SmallRank(list,myself){

		SmallRank.__super.call(this);
		this.init(list,myself);
	}
	//SmallRank
	Laya.class( SmallRank,"SmallRank", smallRankViewUI);
	
	var _proto = SmallRank.prototype;
	
	_proto.init = function(list,myself){
		if (!list || list.length == 0) {
            return;
        }
		
		this.smallList.removeChildren();
		for (var i = 0; i < list.length; i++) {
            var item = new RankItem(list[i],0,myself);
            this.smallList.addChild(item);

			//-- 历史最高纪录
			if(myself && list[i].topNum == myself){
				this.hisScore.text = "历史最高分：" + list[i].kvdata.value.game.score;

			}

        }

		


	}

	
	
})();

























(function () {
	
	/**
	 * 排行榜列表
	 */
	function RankItem(user,type,myself){

		RankItem.__super.call(this);
		this.init(user,type,myself);
	}
	//RankItem
	Laya.class( RankItem,"RankItem", rankViewItemUI);
	
	var _proto = RankItem.prototype;
	
	_proto.init = function(user,type,myself){
		var theColor = "#fff";

		this.userScore = user.kvdata.value.game.score;

		this.face.skin = user.headimg;
		this.nickName.text = user.nick;
		this.score.text = this.userScore;
		this.rankNum.text = user.topNum;

		//-- 总排行之底部我的战绩
		if(type == 1){
			this.itemBg.visible = false;
			this.nickName.color = theColor;
			this.score.color = theColor;
			this.rankNum.color = theColor;
		}

		this.changeSkin(user.topNum);

		//-- 小排行我的战绩高亮
		if(myself && user.topNum == myself){
			this.nickName.color = theColor;
			this.score.color = theColor;
			this.rankNum.color = theColor;
			this.itemBg.skin = "res/rank/itemBg2.png";

		}

	}

	//-- 奖杯换肤
	_proto.changeSkin = function(topNum){

		switch( Number(topNum) ){
			case 1: 
				this.rankNum.visible = false;
				this.theCup.visible = true;
				break;
			case 2: 
				this.rankNum.visible = false;
				this.theCup.visible = true;
				this.theCup.skin = "res/rank/the2.png";
				break;
			case 3: 
				this.rankNum.visible = false;
				this.theCup.visible = true;
				this.theCup.skin = "res/rank/the3.png";
				break;


		}
	}
	
})();

























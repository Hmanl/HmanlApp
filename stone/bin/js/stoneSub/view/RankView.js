(function () {
	
	/**
	 * 排行榜
	 */
	function RankView(list,myNumList){

		RankView.__super.call(this);
		this.init(list,myNumList);
	}
	//RankView
	Laya.class( RankView,"RankView", rankingViewUI);
	
	var _proto = RankView.prototype;
	
	_proto.init = function(list,myNumList){

		console.log(list,myNumList)
		if (!list || list.length == 0) {
            return;
        }
		
		this.friendList.removeChildren();
		for (var i = 0; i < list.length; i++) {
            list[i].topNum = (i+1).toString();
            var item = new RankItem(list[i],0);
            item.y = i;
            this.friendList.addChild(item);
        }

		this.myNumList.removeChildren();
		var myNumItem = new RankItem(myNumList,1);
		this.myNumList.addChild(myNumItem);
        


	}


	/*按钮缩小效果*/
	_proto.scaleAc = function(target,callBack){         
		target.on(Laya.Event.MOUSE_DOWN, this, this.onBtnDown,[target]);
		target.on(Laya.Event.MOUSE_MOVE, this, this.onBtnMove,[target]);
		target.on(Laya.Event.MOUSE_UP, this, this.onBtnUp,[target,callBack]);	
		target.on(Laya.Event.MOUSE_OUT, this, this.onBtnOut,[target]);
	}

	/*鼠标按下*/
	_proto.onBtnDown = function(target){       
		target.scale(0.9,0.9);
	}
		
	/*鼠标抬起*/
	_proto.onBtnUp = function(target,callBack){         
		target.scale(1,1);
		if(callBack){
			callBack(this)
		}

	}

	/*鼠标按下*/
	_proto.onBtnMove = function(target,e){    
		e.stopPropagation() 
		// return false;
			
	}

	/*鼠标移出*/
	_proto.onBtnOut = function(target){         
		target.scale(1,1);

	}
	
})();

























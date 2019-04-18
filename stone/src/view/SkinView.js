(function () {
	
	/**
	 * 皮肤商城
	 */
	function SkinView(list){

		SkinView.__super.call(this);
		this.init(list);
	}
	//GameView
	Laya.class(SkinView,"SkinView", skinViewUI);
	
	var _proto = SkinView.prototype;
	
	_proto.init = function(list){
		//-- 返回按钮 
		Config.scaleBtn(this.backBtn,this.backGame);

		//-- 遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});
		var skinListData = lx.getStorageSync("skinListData");
        var list;
        if(skinListData){
            list = skinListData; 
        }else{
            list = Config.skinList;
        }

		if (!list || list.length == 0) {
            return;
        }

		//-- 排序成3*3商店
		for(var i=0;i<list.length;i++){
			var item = list[i];
			// item.index = i;
			var  skinItem = new SkinItemView(item);
			skinItem.left = (skinItem.width +15) * (i%3);			
			skinItem.top = (skinItem.height +12) *  parseInt(i/3);
            this.skinList.addChild(skinItem);

		}


	}

	/*游戏返回开始界面*/
    _proto.backGame = function(self){  	
		Laya.skinView.removeSelf();
    }
	
	
})();

























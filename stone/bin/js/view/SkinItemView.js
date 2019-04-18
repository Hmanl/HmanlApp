(function () {
	
	/**
	 * 皮肤商城列表格子
	 */
	function SkinItemView(item){

		SkinItemView.__super.call(this);
		this.init(item);
		
		

	}

	Laya.class(SkinItemView,"SkinItemView", skinItemViewUI);
	
	var _proto = SkinItemView.prototype;
	
	_proto.init = function(item){

		/*按钮配置列表*/
		var btnSkinArr = ["lockBtn","useBtn","unlockbtn"];
		var status = Number(item.btnStatus);
		// console.log(item);
		this.temp = item;
		var localUrl = "res/laya2d/ballSkin/";
		this.ballSkin.skin = localUrl + item.skin +  ".png";
		this.ballSkin.name =  item.skin;
		this.coinNum.text = item.coinNums;
		this.btnStatu.skin = "res/laya2d/"  + btnSkinArr[item.btnStatus] + ".png";
		this.btnStatu.status = status;
		this.btnCfg(status);

		if(status == 0){
			this.btnStatu.disabled = true;
			this.btnStatu.gray = false;
		}
	
		Config.scaleBtn(this.btnStatu,this.btnChange,this);
		if(status == 1 ){
			this.btnStatu.disabled = true;
			this.btnStatu.gray = false;
		}	

	}

	
	//-- 按钮初始化配置
    _proto.btnCfg = function(status){  	
		var status = Number(status);
		switch(status){
			case 0 : 			
				this.lockIco.visible = true;
				break;
			case 1 : 
				this.coinNum.visible = false;

				break;
			case 2 : 
				this.coinNum.visible = false;
				break;

		}


    }

	//-- 按钮初始化
	_proto.btnInit= function(childs,self){  
		
		for(var i=0;i<childs.length;i++){
			var item = childs[i];
			item.btnStatu.disabled = false;
			var status = Number(item.btnStatu.status);
			if(status == 1 ){
				childs[i].btnStatu.skin = "res/laya2d/unlockbtn.png";
	
			}
			
		}
	}

	//-- 按钮切换
	_proto.btnChange = function(self){  
		//-- 按钮初始化
		self.btnInit( self.parent._childs,self);
		// console.log(self.temp)
		self.btnStatu.skin = "res/laya2d/useBtn.png";
		self.btnStatu.status = 1 ;
		self.btnStatu.disabled = true;
		self.btnStatu.gray = false;

		lx.setStorageSync("skinBallNow",self.ballSkin.name);

		self.skinListData(self.temp);


		//-- 换肤
		var material = new Laya.StandardMaterial();
        material.diffuseTexture = Laya.Texture2D.load("res/ballSkin/" + self.ballSkin.name  +  ".jpg" );
        material.specularColor = new Laya.Vector4(0,0,0,1);
        LayaAir3D.ballSp.meshRender.material = material;
	}

	//-- 按钮切换之皮肤存储
	_proto.skinListData = function(item){
		var skinListData = lx.getStorageSync("skinListData");
		var theList ;

		if(skinListData){
			theList = skinListData;
		}else{
			theList = Config.skinList;
		}
		for(var i=0;i<theList.length;i++){
			var skinItem = theList[i];
			if(skinItem.btnStatus != 0 && item.index != skinItem.index){
				skinItem.btnStatus = 2;	
				theList[i] = skinItem;
			}

			if( item.index == skinItem.index){
				skinItem.btnStatus = 1;	
				theList[i] = skinItem;
			}
				
		}

		lx.setStorageSync("skinListData",theList);
	}
})();

























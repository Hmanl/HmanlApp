(function () {
	
	/**
	 * 复活界面
	 */
	function ReliveView(){

		ReliveView.__super.call(this);
		this.init();
	}
	//ReliveView
	Laya.class(ReliveView,"ReliveView", reliveViewUI);
	
	var _proto = ReliveView.prototype;
	
	_proto.init = function(){
		
		// if(lx.showRewardedVideoAd){
		// 	this.adBtn.visible = true;
		// 	this.passBtn.visible = false;
		// 	this.passtext.visible = true;

		// 	//-- 视屏复活按钮
		// 	Config.scaleBtn(this.adBtn,this.adShow,this);

		// 	//-- 跳过复活按钮
		// 	Config.scaleBtn(this.passtext,this.overShow,this);
		// }else{
		// 	//-- 跳过复活按钮
		// 	Config.scaleBtn(this.passBtn,this.overShow,this);
		// }
		//-- 跳过复活按钮
		Config.scaleBtn(this.passBtn,this.overShow,this);

		if(typeof(sharedCanvas) != "undefined"){
            Config.accelerometer.stopAccelerometer();
        }
		

		//遮罩阻止冒泡
		this.theMask.on(Laya.Event.MOUSE_MOVE, this,function(e){
			e.stopPropagation();
		});

		//-- 复活币设置
        var reliveCoinsData = lx.getStorageSync("reliveCoins");


		if(reliveCoinsData){
			this.liveNum.text = reliveCoinsData.reliveCoins;
			if(Number(reliveCoinsData.reliveCoins) == 0){
				this.tips.visible = true;
				console.log(this.tips.visible)
			}else{
				this.tips.visible = false;
				//-- 复活继续按钮
				Config.scaleBtn(this.reliveBtn,this.againGame,this)
			}
		}
		
		
		

		

	}

	//-- 复活继续
	_proto.againGame = function(self){
		Config.istake = false;
		Config.isOver = false;
		var step =  LayaAir3D.dieFloorList
		var x = step[step.length -1].x;
		var y = step[step.length -1].y;
		var z = step[step.length -1].z;
		LayaAir3D.ball.acName = ""
		LayaAir3D.ball.transform.scale = new Laya.Vector3(1, 1, 1);
		LayaAir3D.ball.transform.position = new Laya.Vector3(x,y + 0.5, z + 1.6);
		LayaAir3D.camera.transform.position = new Laya.Vector3(x, y + 1.9, z + 2.7);
		self.removeSelf();
		LayaAir3D.ball.getComponentByType(BallScript).maskFlag = false;
		LayaAir3D.ball.getComponentByType(BallScript).liveFlag = true;
		LayaAir3D.ball.getComponentByType(BallScript).speedZ = -0.08;

		if(typeof(sharedCanvas) != "undefined"){
             Config.accelerometer.startAccelerometer(function(rotationInfo){

                var instacne = 0.1;    
                var limit = 0.45;
                var ballPosX = LayaAir3D.ball.transform.position.x;
                // LayaAir3D.info.text =  "gamma:" +  rotationInfo.x ;


                if(ballPosX > limit){
                    LayaAir3D.ball.transform.position.x = limit
                }else  if(ballPosX < -limit){
                    LayaAir3D.ball.transform.position.x = -limit
                }  
                LayaAir3D.ball.transform.translate(new Laya.Vector3(instacne*rotationInfo.x,0, 0), false);

            });
        }



		//-- 复活币设置
        var reliveCoinsData = lx.getStorageSync("reliveCoins");

		reliveCoinsdata = {"reliveCoins":Number(reliveCoinsData.reliveCoins) - 1,"istake":false};
		lx.setStorageSync("reliveCoins",reliveCoinsdata);

	}

	//-- 跳过复活
	_proto.overShow = function(self){
		self.removeSelf();
		self.beginFunDeath();
	}

	//-- 视频复活
	_proto.adShow = function(self){
		lx.showRewardedVideoAd({
            adUnitId: lx.config.adUnitId,
            success: function(res){
                // res.isEnded ? self.addItem() : self.setTooltip(lx.i18n.t("label_text.adv_1"));     
                // this.revive2.getComponent(cc.Button).interactable=true;                          
            },
            fail: function(err){
                
            }
            
        });


	}
	

	 /**
     * 死亡边界碰撞开始函数
     */
    _proto.beginFunDeath = function(){
		if(typeof(sharedCanvas) != "undefined"){
            Config.accelerometer.stopAccelerometer();
        }
		
		Laya.timer.once(300,this,function(){
      
            Laya.gameOver.visible = true;
        }.bind(this))
	
		Laya.gameOver.endScore.text = "最终得分："  + Laya.gameView.score.text;


		lx.postMessage({
			message: JSON.stringify({tag:"postUserScore", data:{score: Laya.gameView.score.text}})
		});
		
		

		var highScore =  lx.getStorageSync("highScore");
	
		if(!highScore){
			Laya.gameOver.hisScore.text = "历史最高分：" + Laya.gameView.score.text;
			lx.setStorageSync("highScore",Laya.gameView.score.text);
		}else{           
			if( Number( highScore) < Number(Laya.gameView.score.text )){
				lx.setStorageSync("highScore",Laya.gameView.score.text);  
				Laya.gameOver.hisScore.text = "历史最高分：" + Laya.gameView.score.text;
			}else{
				Laya.gameOver.hisScore.text = "历史最高分：" + highScore;
			}
			
		}

		var theScore = Laya.gameView.score.text;


		//-- 解锁皮肤
		var skinListData = lx.getStorageSync("skinListData");
		var theList ;
		if(skinListData){
			theList = skinListData;
		}else{
			theList = Config.skinList;
		}
		for(var i=0;i<theList.length;i++){
			var skinItem = theList[i];
			if(skinItem.btnStatus == 0 &&  skinItem.coinNums <= Number(theScore)){
				skinItem.btnStatus = 2;
				theList[i] = skinItem;
				
			}
		}

		lx.setStorageSync("skinListData",theList);
		
		

		lx.postMessage({
			message: JSON.stringify({tag:"getUserScore"})
		});
        Laya.timer.once(300,this,function(){
			LayaAir3D.prototype.showRank("getSmallRankList");
		}.bind(this))
		
    }
})();

























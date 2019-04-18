var CLASS$=Laya.class;
var STATICATTR$=Laya.static;
var View=laya.ui.View;
var Dialog=laya.ui.Dialog;
var gameOverViewUI=(function(_super){
		function gameOverViewUI(){
			
		    this.theMask=null;
		    this.backBtn=null;
		    this.skinBtn=null;
		    this.againBtn=null;
		    this.shareBtn=null;
		    this.endScore=null;
		    this.hisScore=null;
		    this.tellBtn=null;

			gameOverViewUI.__super.call(this);
		}

		CLASS$(gameOverViewUI,'ui.gameOverViewUI',_super);
		var __proto__=gameOverViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(gameOverViewUI.uiView);

		}

		gameOverViewUI.uiView={"type":"View","props":{"width":640,"visible":true,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"var":"theMask","alpha":0.8},"child":[{"type":"Rect","props":{"width":640,"lineWidth":1,"height":1500,"fillColor":"#000000"}}]},{"type":"Image","props":{"y":55,"x":69,"var":"backBtn","skin":"res/laya2d/backBtn.png","pivotY":41,"pivotX":39}},{"type":"Image","props":{"y":1078,"x":551,"var":"skinBtn","skin":"res/laya2d/skinBtn.png","pivotY":58,"pivotX":39}},{"type":"Image","props":{"y":933,"x":161,"var":"againBtn","skin":"res/laya2d/againBtn.png","pivotY":40,"pivotX":115}},{"type":"Image","props":{"y":933,"x":480,"var":"shareBtn","skin":"res/laya2d/shareBtn.png","pivotY":40,"pivotX":115}},{"type":"Text","props":{"y":140,"x":0,"width":640,"var":"endScore","valign":"middle","text":"最终得分：0","fontSize":50,"color":"#ffffff","bold":true,"align":"center"}},{"type":"Text","props":{"y":800,"x":0,"width":640,"visible":false,"var":"hisScore","text":"历史最高分：0","strokeColor":"#679AF8","stroke":6,"fontSize":36,"color":"#ffffff","bold":true,"align":"center"}},{"type":"Image","props":{"y":1080,"x":90,"var":"tellBtn","skin":"res/laya2d/tellBtn.png","pivotY":58,"pivotX":39}}]};
		return gameOverViewUI;
	})(View);
var gameViewUI=(function(_super){
		function gameViewUI(){
			
		    this.dmNums=null;
		    this.score=null;
		    this.giftTip=null;
		    this.addScore=null;
		    this.countDnText=null;
		    this.guideAniBox=null;

			gameViewUI.__super.call(this);
		}

		CLASS$(gameViewUI,'ui.gameViewUI',_super);
		var __proto__=gameViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(gameViewUI.uiView);

		}

		gameViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Image","props":{"width":40,"visible":false,"top":100,"skin":"res/laya2d/diamsIco.png","right":30,"height":40}},{"type":"Text","props":{"y":94,"x":0,"width":550,"visible":false,"var":"dmNums","text":"0","fontSize":50,"color":"#ffffff","bold":true,"align":"right"}},{"type":"Text","props":{"y":120,"x":0,"width":640,"var":"score","text":"0","fontSize":80,"color":"#ffffff","bold":true,"align":"center"}},{"type":"Text","props":{"y":249,"x":145,"visible":false,"var":"giftTip","text":"恭喜获得黑色8号球","strokeColor":"#ff0000","stroke":6,"fontSize":40,"font":"Microsoft YaHei","color":"#ffffff","bold":true}},{"type":"Label","props":{"y":480,"x":274,"visible":false,"var":"addScore","text":"+100","fontSize":40,"color":"#ffffff"}},{"type":"Text","props":{"y":314,"x":211,"width":218,"visible":false,"var":"countDnText","text":"倒计时：0","height":52,"fontSize":45,"font":"Helvetica","color":"#ffffff","bold":true}},{"type":"Box","props":{"y":429,"x":332,"width":200,"var":"guideAniBox","height":200}}]};
		return gameViewUI;
	})(View);
var guideViewUI=(function(_super){
		function guideViewUI(){
			
		    this.theMask=null;
		    this.guideAniBox=null;

			guideViewUI.__super.call(this);
		}

		CLASS$(guideViewUI,'ui.guideViewUI',_super);
		var __proto__=guideViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(guideViewUI.uiView);

		}

		guideViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":640,"var":"theMask","height":1500,"alpha":0.8},"child":[{"type":"Rect","props":{"width":640,"lineWidth":1,"height":1500,"fillColor":"#000000"}}]},{"type":"Box","props":{"y":420,"x":320,"width":200,"var":"guideAniBox","height":200}},{"type":"Text","props":{"y":722,"x":220,"text":"点击开始","fontSize":50,"color":"#ffffff","bold":false}}]};
		return guideViewUI;
	})(View);
var rankViewUI=(function(_super){
		function rankViewUI(){
			
		    this.theMask=null;
		    this.backBtn=null;

			rankViewUI.__super.call(this);
		}

		CLASS$(rankViewUI,'ui.rankViewUI',_super);
		var __proto__=rankViewUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(rankViewUI.uiView);

		}

		rankViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":640,"var":"theMask","height":1136}},{"type":"Sprite","props":{"y":102,"x":44,"width":51,"height":24},"child":[{"type":"Rect","props":{"width":51,"lineWidth":1,"height":24,"fillColor":"#000000"}}]},{"type":"Image","props":{"y":55,"x":69,"var":"backBtn","skin":"res/laya2d/backBtn.png","pivotY":41,"pivotX":39}}]};
		return rankViewUI;
	})(View);
var reliveViewUI=(function(_super){
		function reliveViewUI(){
			
		    this.theMask=null;
		    this.passBtn=null;
		    this.reliveBtn=null;
		    this.liveNum=null;
		    this.tips=null;
		    this.adBtn=null;
		    this.passtext=null;

			reliveViewUI.__super.call(this);
		}

		CLASS$(reliveViewUI,'ui.reliveViewUI',_super);
		var __proto__=reliveViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(reliveViewUI.uiView);

		}

		reliveViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"var":"theMask","alpha":0.8},"child":[{"type":"Rect","props":{"width":640,"lineWidth":1,"height":1500,"fillColor":"#000000"}}]},{"type":"Image","props":{"y":300,"x":46,"skin":"res/laya2d/relivebg.png"}},{"type":"Image","props":{"y":760,"x":474,"var":"passBtn","skin":"res/laya2d/passBtn.png","pivotY":40,"pivotX":114}},{"type":"Image","props":{"y":760,"x":164,"var":"reliveBtn","skin":"res/laya2d/reliveBtn.png","pivotY":40,"pivotX":114}},{"type":"Label","props":{"y":357,"x":395,"width":80,"var":"liveNum","text":"0","fontSize":52,"color":"#ffffff","bold":true,"align":"center"}},{"type":"Image","props":{"y":555,"x":230,"visible":false,"var":"tips","skin":"res/laya2d/tips.png"}},{"type":"Image","props":{"y":760,"x":474,"visible":false,"var":"adBtn","skin":"res/laya2d/adBtn.png","pivotY":40,"pivotX":114}},{"type":"Text","props":{"y":876,"x":320,"width":158,"visible":false,"var":"passtext","text":"点击跳过","pivotY":14,"pivotX":79,"height":28,"fontSize":26,"color":"#ffffff","align":"center"}}]};
		return reliveViewUI;
	})(View);
var skinItemViewUI=(function(_super){
		function skinItemViewUI(){
			
		    this.ballSkin=null;
		    this.btnStatu=null;
		    this.lockIco=null;
		    this.coinIco=null;
		    this.coinNum=null;

			skinItemViewUI.__super.call(this);
		}

		CLASS$(skinItemViewUI,'ui.skinItemViewUI',_super);
		var __proto__=skinItemViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(skinItemViewUI.uiView);

		}

		skinItemViewUI.uiView={"type":"View","props":{"width":165,"top":0,"left":0,"height":238},"child":[{"type":"Box","props":{"width":165,"top":0,"left":0,"height":238},"child":[{"type":"Image","props":{"skin":"res/laya2d/kuangBg.png"},"child":[{"type":"Image","props":{"y":12,"x":17,"width":130,"var":"ballSkin","height":130}}]},{"type":"Image","props":{"y":202,"x":82,"var":"btnStatu","skin":"res/laya2d/canBuyBtn.png","pivotY":34,"pivotX":79},"child":[{"type":"Image","props":{"y":10,"x":8,"visible":false,"var":"lockIco","skin":"res/laya2d/lockIco.png"}},{"type":"Image","props":{"y":14,"x":8,"visible":false,"var":"coinIco","skin":"res/laya2d/coinIco.png"}},{"type":"Text","props":{"y":16,"x":54,"width":90,"var":"coinNum","text":"0","fontSize":32,"color":"#ffffff","align":"center"}}]}]}]};
		return skinItemViewUI;
	})(View);
var skinViewUI=(function(_super){
		function skinViewUI(){
			
		    this.theMask=null;
		    this.backBtn=null;
		    this.skinList=null;

			skinViewUI.__super.call(this);
		}

		CLASS$(skinViewUI,'ui.skinViewUI',_super);
		var __proto__=skinViewUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(skinViewUI.uiView);

		}

		skinViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"var":"theMask","alpha":0},"child":[{"type":"Rect","props":{"width":640,"lineWidth":1,"height":1500,"fillColor":"#000000"}}]},{"type":"Sprite","props":{"y":0,"x":0,"alpha":0.8},"child":[{"type":"Rect","props":{"y":104,"x":46,"width":50,"lineWidth":1,"height":26,"fillColor":"#000000"}}]},{"type":"Image","props":{"y":55,"x":69,"var":"backBtn","skin":"res/laya2d/backBtn.png","pivotY":41,"pivotX":39}},{"type":"Image","props":{"y":151,"x":34,"skin":"res/laya2d/skinPop.png"}},{"type":"HBox","props":{"y":310,"x":57,"width":525,"var":"skinList","height":770}}]};
		return skinViewUI;
	})(View);
var startViewUI=(function(_super){
		function startViewUI(){
			
		    this.theMask=null;
		    this.startBtn=null;
		    this.rankingsBtn=null;
		    this.gameIcoBtn=null;
		    this.lajiBoxBtn=null;
		    this.skinBtn=null;
		    this.reliveGiftBtn=null;
		    this.theTip1=null;
		    this.theTip2=null;
		    this.theTip3=null;

			startViewUI.__super.call(this);
		}

		CLASS$(startViewUI,'ui.startViewUI',_super);
		var __proto__=startViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(startViewUI.uiView);

		}

		startViewUI.uiView={"type":"View","props":{"y":82,"x":218,"width":640,"pivotY":82,"pivotX":218,"height":1136},"child":[{"type":"Sprite","props":{"y":0,"x":0,"width":640,"var":"theMask","height":1500,"alpha":0.8},"child":[{"type":"Rect","props":{"width":640,"lineWidth":1,"height":1500,"fillColor":"#000000"}}]},{"type":"Image","props":{"y":754,"x":319,"var":"startBtn","skin":"res/laya2d/startBtn.png","pivotY":82,"pivotX":218}},{"type":"Image","props":{"y":72,"x":69,"var":"rankingsBtn","skin":"res/laya2d/rankings.png","pivotY":58,"pivotX":39}},{"type":"Text","props":{"y":900,"x":125,"text":"提示：手机左右倾斜操作小球","fontSize":30,"color":"#ffffff"}},{"type":"Image","props":{"y":214,"x":571,"visible":false,"var":"gameIcoBtn","skin":"res/laya2d/gameIco.png","pivotY":44,"pivotX":41}},{"type":"Image","props":{"y":324,"x":571,"visible":false,"var":"lajiBoxBtn","skin":"res/laya2d/lajiBox.png","pivotY":44,"pivotX":41}},{"type":"Image","props":{"y":1059,"x":109,"var":"skinBtn","skin":"res/laya2d/skinBtn.png","pivotY":59,"pivotX":39}},{"type":"Box","props":{"y":1057,"x":517,"width":119,"var":"reliveGiftBtn","pivotY":57,"pivotX":59,"height":114},"child":[{"type":"Image","props":{"y":0,"x":20,"skin":"res/laya2d/gift.png"}},{"type":"Image","props":{"y":90,"x":0,"var":"theTip1","skin":"res/laya2d/tip1.png"}},{"type":"Image","props":{"y":90,"x":-20,"visible":false,"var":"theTip2","skin":"res/laya2d/tip2.png"}},{"type":"Image","props":{"y":90,"x":-20,"visible":false,"var":"theTip3","skin":"res/laya2d/tip3.png"}}]}]};
		return startViewUI;
	})(View);
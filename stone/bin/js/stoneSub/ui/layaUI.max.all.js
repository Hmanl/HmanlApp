var CLASS$=Laya.class;
var STATICATTR$=Laya.static;
var View=laya.ui.View;
var Dialog=laya.ui.Dialog;
var rankingViewUI=(function(_super){
		function rankingViewUI(){
			
		    this.friendList=null;
		    this.myNumList=null;

			rankingViewUI.__super.call(this);
		}

		CLASS$(rankingViewUI,'ui.rankingViewUI',_super);
		var __proto__=rankingViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(rankingViewUI.uiView);

		}

		rankingViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Image","props":{"y":207,"x":49,"skin":"res/rank/rankPop.png"},"child":[{"type":"VBox","props":{"y":91,"x":20,"width":502,"var":"friendList","space":10,"height":600,"align":"center"}},{"type":"VBox","props":{"y":772,"x":20,"width":502,"var":"myNumList","height":89}}]},{"type":"Image","props":{"y":127,"x":215,"skin":"res/rank/title.png"},"child":[{"type":"Text","props":{"width":209,"valign":"middle","text":"好 友 排 行","height":72,"fontSize":36,"color":"#ffffff","bold":true,"align":"center"}}]}]};
		return rankingViewUI;
	})(View);
var rankViewItemUI=(function(_super){
		function rankViewItemUI(){
			
		    this.itemBg=null;
		    this.rankNum=null;
		    this.face=null;
		    this.nickName=null;
		    this.score=null;
		    this.theCup=null;

			rankViewItemUI.__super.call(this);
		}

		CLASS$(rankViewItemUI,'ui.rankViewItemUI',_super);
		var __proto__=rankViewItemUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(rankViewItemUI.uiView);

		}

		rankViewItemUI.uiView={"type":"View","props":{"y":0,"x":0,"width":502,"height":90},"child":[{"type":"Image","props":{"y":0,"x":0,"var":"itemBg","skin":"res/rank/itemBg.png"}},{"type":"Label","props":{"y":24,"x":47,"var":"rankNum","text":"1","fontSize":42,"color":"#679af8","bold":true}},{"type":"Image","props":{"y":10,"x":107,"width":70,"var":"face","skin":"res/rank/icon.jpg","height":70},"child":[{"type":"Sprite","props":{"renderType":"mask"},"child":[{"type":"Circle","props":{"y":33,"x":34,"radius":35,"lineWidth":1,"fillColor":"#ff0000"}}]}]},{"type":"Label","props":{"y":30,"x":190,"width":122,"var":"nickName","text":"牛1","overflow":"hidden","height":30,"fontSize":30,"color":"#486CAD","align":"center"}},{"type":"Label","props":{"y":30,"x":358,"width":134,"var":"score","text":"12321312","overflow":"hidden","height":30,"fontSize":30,"color":"#486CAD","align":"center"}},{"type":"Image","props":{"y":19,"x":27,"visible":false,"var":"theCup","skin":"res/rank/the1.png"}}]};
		return rankViewItemUI;
	})(View);
var smallRankViewUI=(function(_super){
		function smallRankViewUI(){
			
		    this.smallList=null;
		    this.hisScore=null;

			smallRankViewUI.__super.call(this);
		}

		CLASS$(smallRankViewUI,'ui.smallRankViewUI',_super);
		var __proto__=smallRankViewUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(smallRankViewUI.uiView);

		}

		smallRankViewUI.uiView={"type":"View","props":{"width":640,"height":1136},"child":[{"type":"Image","props":{"y":220,"x":46,"skin":"res/rank/overPop.png"},"child":[{"type":"VBox","props":{"y":143,"x":22,"width":502,"var":"smallList","space":20,"height":300}}]},{"type":"Text","props":{"y":800,"x":0,"width":640,"var":"hisScore","text":"历史最高分：0","strokeColor":"#679AF8","stroke":4,"fontSize":36,"color":"#ffffff","bold":true,"align":"center"}}]};
		return smallRankViewUI;
	})(View);
!function(){function n(t,i){n.__super.call(this),this.init(t,i)}Laya.class(n,"RankView",rankingViewUI);var t=n.prototype;t.init=function(n,t){if(console.log(n,t),n&&0!=n.length){this.friendList.removeChildren();for(var i=0;i<n.length;i++){n[i].topNum=(i+1).toString();var o=new RankItem(n[i],0);o.y=i,this.friendList.addChild(o)}this.myNumList.removeChildren();var e=new RankItem(t,1);this.myNumList.addChild(e)}},t.scaleAc=function(n,t){n.on(Laya.Event.MOUSE_DOWN,this,this.onBtnDown,[n]),n.on(Laya.Event.MOUSE_MOVE,this,this.onBtnMove,[n]),n.on(Laya.Event.MOUSE_UP,this,this.onBtnUp,[n,t]),n.on(Laya.Event.MOUSE_OUT,this,this.onBtnOut,[n])},t.onBtnDown=function(n){n.scale(.9,.9)},t.onBtnUp=function(n,t){n.scale(1,1),t&&t(this)},t.onBtnMove=function(n,t){t.stopPropagation()},t.onBtnOut=function(n){n.scale(1,1)}}();
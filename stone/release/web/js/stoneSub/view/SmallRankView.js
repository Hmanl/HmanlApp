!function(){function t(i,n){t.__super.call(this),this.init(i,n)}Laya.class(t,"SmallRank",smallRankViewUI);t.prototype.init=function(t,i){if(t&&0!=t.length){this.smallList.removeChildren();for(var n=0;n<t.length;n++){t[n].topNum=(n+1).toString();var l=new RankItem(t[n],0,i);this.smallList.addChild(l)}}}}();
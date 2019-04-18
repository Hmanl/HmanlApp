function onLoad(){getUserScore(),lx.onMessage(function(e){if(void 0!=e.message){console.log("我是子域 接收到主域来的消息"+e.message);var a=JSON.parse(e.message);switch(a.tag){case"setSize":Laya.Browser.window.sharedCanvas.width=a.data.width,Laya.Browser.window.sharedCanvas.height=a.data.height;var o=a.data.matrix,s=new Laya.Matrix;s.a=o.a,s.b=o.b,s.c=o.c,s.d=o.d,Laya.stage._canvasTransform=s;break;case"getUserScore":getUserScore();break;case"postUserScore":compareScore(a.data.score);break;case"getRankList":getRankList(0);break;case"showRankView":showRankView();break;case"closeRankView":closeRankView();break;case"getSmallRankList":getRankList(1);break;case"showSmallRankView":showSmallRankView();break;case"visibaleSmallRank":window.smallRankView.visible=!0;break;case"closeSmallRankView":closeSmallRankView()}}})}function getUserScore(){lx.getUserCloudStorage({key:"score",success:function(e){setUserScore(e)}})}function setUserScore(e){console.log("设置用户最高分数",e),window.userScoreInfo=e,window.maxScore=e&&e.value?e.value.game.score:-1}function compareScore(e){Number(e)>Number(window.maxScore)?(console.log(2),postUserScore(e)):console.log("分数低于历史最高分")}function postUserScore(e){lx.setUserCloudStorage({kvdata:{key:"score",value:{game:{score:e,update_time:(new Date).getTime()}}},success:function(){console.log("上传成功")}})}function getRankList(e){var a=[],o=!0;lx.getFriendCloudStorage({key:"score",success:function(s){if(console.log("微信好友排行数据",JSON.stringify(s)),a=s,a=a.sort(compare("score")),window.userScoreInfo)for(var n=0;n<a.length;n++){var i=a[n];i.topNum=n+1,1!=e&&JSON.stringify(i.kvdata.value)!=JSON.stringify(window.userScoreInfo.value)||(window.myTopNumList=i,a.length>3?window.smallRankList=a.slice(n-1,n+1):window.smallRankList=a,1==e&&(showSmallRankView(i.topNum),o=!1))}0==e&&showRankView(a)}})}function showRankView(e){this.rankView=new RankView(e.slice(0,6),window.myTopNumList),Laya.stage.addChild(this.rankView)}function closeRankView(){this.rankView.removeSelf()}function showSmallRankView(e){console.log("小排行",window.smallRankList),window.smallRankView=new SmallRank(window.smallRankList,e),Laya.stage.addChild(window.smallRankView)}function closeSmallRankView(){window.smallRankView.removeSelf()}function compare(e){return function(a,o){if(a&&o){var s=a.kvdata.value.game[e];return o.kvdata.value.game[e]-s}return 1}}
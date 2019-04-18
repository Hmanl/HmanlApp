
function onLoad(){
    // if(Laya.Browser.onWeiXin){
        getUserScore();
        // getRankList();

        lx.onMessage(function(data){
            if (data.message == undefined) return;
            console.log("我是子域 接收到主域来的消息" + data.message);

            var jsonData = JSON.parse(data.message);
            switch (jsonData.tag) {

                case "setSize": {

                    Laya.Browser.window.sharedCanvas.width = jsonData.data.width;

                    Laya.Browser.window.sharedCanvas.height = jsonData.data.height;

                    var tempMatrix = jsonData.data.matrix;

                    var matrix = new Laya.Matrix();

                    matrix.a = tempMatrix.a;

                    matrix.b = tempMatrix.b;

                    matrix.c = tempMatrix.c;

                    matrix.d = tempMatrix.d;

                    Laya.stage._canvasTransform = matrix;//重新设置矩阵

                    break;

                }

                //-- 获取好友上传分数
                case "getUserScore": {
                    getUserScore();
                    break;
                }

                //-- 上传好友分数
                case "postUserScore": {
                    compareScore(jsonData.data.score);
                    break;
                }

                //-- 获得好友排行数据
                case "getRankList": {
                    getRankList(0);
                    break;
                }

                //--渲染好友排行ui界面
                case "showRankView": {
                    showRankView();                       
                    break;
                }

                //--关闭好友排行ui界面
                case "closeRankView": {
                    closeRankView();                       
                    break;
                }
                
                //-- 获得好友小排行数据
                case "getSmallRankList": {
                    getRankList(1);
                    break;
                }

                //--渲染好友小排行ui界面
                case "showSmallRankView": {
                    showSmallRankView();                       
                    break;
                }

                //--渲染好友小排行ui界面
                case "visibaleSmallRank": {
                    window.smallRankView.visible = true;                         
                    break;
                }

                //--关闭好友小排行ui界面
                case "closeSmallRankView": {
                    closeSmallRankView();                       
                    break;
                }


            }
        })
    
    
}

// 获取玩家托管数据
function  getUserScore(){
    var self = this;
    lx.getUserCloudStorage({
        key : "score",
        success : function(data){
            setUserScore(data);
        },
    });
}

// 设置用户最高分数
function setUserScore (data){
    console.log("设置用户最高分数",data)
    window.userScoreInfo = data;
    window.maxScore = data && data.value ? data.value.game.score : -1;
}

// 比较分数是否上传
function compareScore(currentScore){
        if(Number(currentScore)  > Number( window.maxScore)  ){
        // 大于当前分数
        postUserScore(currentScore);
    } else {
        console.log("分数低于历史最高分")
    }
}


// 上传分数
function postUserScore(theScore){ 

    lx.setUserCloudStorage({
        kvdata: {
            key: "score",
            value:{
                game: {
                    score: theScore,
                    update_time: new Date().getTime()
                }   
            }
        },
        success : function(){
            console.log("上传成功")
        },
    });
}

//-- 获得微信好友排行数据
function getRankList(num){
    var rankList = [];
    var self = this;  
    var flag = true;
    lx.getFriendCloudStorage({
        key : "score",
        success: function(res){
            console.log("微信好友排行数据",JSON.stringify(res) );
            rankList = res;
            rankList = rankList.sort(compare("score"));
            console.log(rankList)

            if(window.userScoreInfo){ 
                //-- 有我的信息 匹配我的位置,得到我的位置id
                for(var i = 0; i < rankList.length; i++){
                    var item = rankList[i];
                    item.topNum = (i + 1);

                    if(JSON.stringify(item["kvdata"]["value"])  == JSON.stringify(window.userScoreInfo["value"])){                        
                        window.myTopNumList = item;
                        
                        if(rankList.length > 3){
                            if(i == 0){
                                window.smallRankList = rankList.slice(0,i+3);
                            }else{
                                window.smallRankList = rankList.slice(i-1,i+2);
                            }
                            
                        }else{
                            window.smallRankList = rankList;
                        }    
       
                        if(num == 1 && flag  ){

                            showSmallRankView(item.topNum);
                            flag = false;
                        }

                    }

                    
                }
            }
            if(num == 0){
                //-- 显示总排行榜
                showRankView(rankList);
            }

            
        }
    });
}

//-- 显示排行榜
function showRankView(rankList){
    //接收到显示排行榜的消息
    this.rankView = new RankView(rankList.slice(0, 6),window.myTopNumList);
    Laya.stage.addChild(this.rankView);


}

//-- 关闭排行榜
function closeRankView(){
    this.rankView.removeSelf();
}

//-- 显示小排行榜
function showSmallRankView(myself){
    //接收到显示排行榜的消息              
    console.log("小排行" , window.smallRankList) 
    Laya.timer.once(300,this,function(){
        window.smallRankView = new SmallRank(window.smallRankList,myself);   
        Laya.stage.addChild( window.smallRankView);
    }.bind(this)) 
    

}

//-- 关闭小排行榜
function closeSmallRankView(){
    window.smallRankView.removeSelf();
}


//-- 排序
function compare(prop){
    return function(obj1,obj2){
        if(!obj1 || !obj2){
            return 1;
        } else {
            var val1 = obj1["kvdata"]["value"]["game"][prop];
            var val2 = obj2["kvdata"]["value"]["game"][prop];
            return val2 - val1;
        }
    }
}

var butils = require("butils");
cc.Class({
    extends: cc.Component,

    properties: {
        rankView : cc.Node,
        rankSmallView : cc.Node,
    },
    onLoad () {
        cc.log("我是子域");
        // 如果是canvas渲染模式，禁用脏矩
    	if (cc.renderer == cc.rendererCanvas) {
            cc.renderer.enableDirtyRegion(false);
        }

        //-- 获取玩家托管数据
        this.getUserScore();

        //-- 获取好友托管数据
        this.getFriendScore();

        this.onMessage = function(data){
            switch(data.message.cmd){
                case "postUserScore":
                    // cc.log(data.message)
                    this.compareScore(data.data.score);
                    break;
                case "hide":
                    this.hideAllChildren();
                    break;
                case "rank":
                    this.checkRankList(0);
                    break;
                case "closeRank":
                    this.closeRank();
                    break; 
                case "rankSmall":
                    this.checkRankList(1);
                    break;
                case "closeRankSmall":
                    this.closeRankSmall();
                    break; 
                    
            }
        }.bind(this);
    },

    onEnable(){
        //-- 监听事件
        lx.onMessage(this.onMessage);
    },

    onDisable(){
        //-- 监听事件
        lx.offMessage(this.onMessage);
    },


    //-- 获取玩家托管数据
    getUserScore: function(){
        var self = this;
        lx.getUserCloudStorage({
            key : "userScore",
            success : function(data){
                self.setUserScore(data);
            },
        });
    },

    // 设置用户最高分数
    setUserScore : function(data){
        window.userScoreInfo = data;
        window.maxScore = data && data["value"] ? data["value"]["game"]["score"] : -1;
    },


    //-- 获取好友托管数据
    getFriendScore : function(){      
        lx.getFriendCloudStorage({
            key : "userScore",
            success: function(data){
                window.friendScore = data;
            }
        });
    },

    

    //-- 首页排行榜
    checkRankList: function(type){
        
        var dataList = window.friendScore;
        cc.log("dataList ",dataList);
    //     dataList = [{"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩601","headimg":"http://pp.lexun.com/headimg/32X32/head_99.jpg","kvdata":{"key":"userScore","value":{"game":{"score":78,"update_time":1543892421096}}}},
    //     {"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩2","headimg":"http://pp.lexun.com/headimg/32X32/head_91.jpg","kvdata":{"key":"userScore","value":{"game":{"score":1000,"update_time":1543492256424}}}},
    //     {"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩3","headimg":"http://pp.lexun.com/headimg/32X32/head_92.jpg","kvdata":{"key":"userScore","value":{"game":{"score":2000,"update_time":1543492256424}}}},
    //     {"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩4","headimg":"http://pp.lexun.com/headimg/32X32/head_93.jpg","kvdata":{"key":"userScore","value":{"game":{"score":100,"update_time":1543492256424}}}},
    //     {"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩5","headimg":"http://pp.lexun.com/headimg/32X32/head_94.jpg","kvdata":{"key":"userScore","value":{"game":{"score":4,"update_time":1543492256424}}}},
    //     {"token":"6RL7AxeMPUs4gRjNYvOznQ==","nick":"浩1","headimg":"http://pp.lexun.com/headimg/32X32/head_95.jpg","kvdata":{"key":"userScore","value":{"game":{"score":5,"update_time":1543492256424}}}},
    // ]

        var dataListLen = dataList.length;
        dataList = dataList.sort(butils.compare("score"));
        cc.log("打开排行榜",JSON.stringify(dataList));
        if(dataListLen > 0){
            if(window.userScoreInfo){ 
                // 有我的信息 匹配我的位置,得到我的位置id
                for(var i = 0; i < dataListLen; i++){
                    var item = dataList[i];
                    if(JSON.stringify(item["kvdata"]["value"])  === JSON.stringify( window.userScoreInfo["value"])   ){
                        this.myidx = i;                  
                    }

                }
            } else {
                // 没有我的信息 设置myidx为-100(为负数表示没有自己的数据)
                this.myidx = -100;
            }
        }
  
        if(type == 0){
            //拿到数组前30的数据进行渲染
            this.rankView.getComponent("rank").renderRankList(dataList.slice(0, 30), this.myidx);

            // 渲染首页排行榜
            this.rankView.active = true;
        }else{
            //拿到数组前30的数据进行渲染
            this.rankSmallView.getComponent("rankSmall").renderRankList(dataList.slice(0, 30), this.myidx);
        }

    },

    //-- 关闭首页排行榜
    closeRank :function(){
        this.rankView.active = false;
    },

    closeRankSmall : function(){
        this.rankSmallView.active = false;
    },


    //-- 比较分数
    compareScore : function(currentScore){
        if(currentScore > window.maxScore){
            // 大于当前分数
            cc.log(currentScore)
            this.postUserScore(currentScore);
        } else {
            // 渲染结算排行榜
            this.rankSmallView.active = true;
        }
    },

    //-- 上传分数
    postUserScore: function(score){ 
        window.changeScore = true;
        var onSuccess = function(){           
            // 渲染结算排行榜
            cc.log("成功上传分数")
            this.rankSmallView.active = true;
        }.bind(this);


        lx.setUserCloudStorage({
            kvdata:{
                key: "userScore", 
                value: {
                    game: {
                        score: score,
                        update_time: new Date().getTime()
                    }
                }
            }, 
            success : onSuccess,               
        });
    },

});

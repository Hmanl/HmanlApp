
cc.Class({
    extends: cc.Component,

    properties: {
        gameIng:cc.Node,
        light:cc.Node,
        sceneView:cc.Node,
        rankView:cc.Node,
    },



    onLoad () {
        this.lxInit();
        this.scene_tag=false;//game场景预加载
        this.onclick=false;
        this.preLoadScene();//场景预加载
        this.lightAni();
    },

    //场景预加载
    preLoadScene:function(){
        cc.director.preloadScene("game", function () {
            this.scene_tag=true;
            cc.log("场景加载完成")
        }.bind(this));
    },

      //乐讯初始化
    lxInit:function(){
        lx.config.set({
            gameid: 100100,

        });
        
        var parm = {
            scope: "scope.userInfo",
            success:function(res){         
                //弹出乐讯登陆框
                    lx.login({
                    success:function(res){
                        
                    }.bind(this)

                });
            }.bind(this),

            fail:function(){
                lx.authorize(parm);
            },
        };
        lx.authorize(parm);  
    },

    //开始游戏
    onStartGame:function(){
        if(this.scene_tag==true){
            cc.director.loadScene("game");
        }
        else{
            this.onclick=true;
            this.preSceneAni();
        }
    },
    
    //光动画
    lightAni:function(){
        var repeat = cc.repeatForever(cc.rotateBy(2, 360));
        this.light.runAction(repeat);
    },

    preSceneAni:function(){
        this.gameIng.active=true;
        this.sceneView.active=false;
    },

    //打开排行榜
    onClickRank:function(){
        this.rankView.active=true;
        cc.find("Canvas/Layout/sharedCanvas").active = true;
        lx.postMessage({
            message: {cmd:"rank"}
        });
    },

    //关闭排行榜
    oncloseRank:function(){
        this.rankView.active=false;
        cc.find("Canvas/Layout/sharedCanvas").active = false;
        lx.postMessage({
            message: {cmd:"closeRank"}
        });
    },

    //分享
    shareGame:function(){
        lx.shareAppMessage({
            title: "大大大哥别追我，我我我我把钱给你",
            imageUrl: 'https://h5.lexun.com/games/wx/avatar/g18.jpg',
            success: function(){                
                
            }.bind(this),
        });  
    },

    update (dt) {
        if(this.onclick==true){
            if(this.scene_tag==true){
                this.scene_tag=false;
                cc.director.loadScene("game");
            }
        }
    },
});

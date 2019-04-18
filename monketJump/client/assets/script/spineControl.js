
cc.Class({
    extends: cc.Component,

    properties: {
        ach_content:cc.Node,//成就容器
        achItem:cc.Prefab,//成就Item
    },



    onLoad () {
        if(this.node.name=="notice2"){
            //新手引导界面
            if(lx.language=="en"){
                cc.log("en")
                this.node.getComponent(sp.Skeleton).animation="GUIDE_E";
            }
            else{
                cc.log("zh")
                this.node.getComponent(sp.Skeleton).animation="GUIDE";
            }
        }
    },

    onEnable(){
        if(this.node.name=="gameOver"){
            if(lx.config.platform=="weixin"){
                if(this.bannerAd){
                    this.bannerAd.show();
                }
                else{
                    this.creatrBanner();    
                }
            }
            //结束界面
            if(lx.language=="en"){
                this.node.getChildByName("again").getChildByName("score").getComponent(sp.Skeleton).animation="again_E";
                this.node.getChildByName("share").getChildByName("score").getComponent(sp.Skeleton).animation="invite_E";
            }
            else{
                this.node.getChildByName("again").getChildByName("score").getComponent(sp.Skeleton).animation="again";
                this.node.getChildByName("share").getChildByName("score").getComponent(sp.Skeleton).animation="invite";
            }
            
        }
        if(this.node.name=="getSkin"){
            //得到皮肤界面
            if(lx.language=="en"){
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_skin_E";
            }
            else{
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_skin";
            
            }
        }
        if(this.node.name=="prize"){
            //得到prize界面
            if(lx.language=="en"){
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_skin_E";
            }
            else{
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_skin";
            
            }
        }
        if(this.node.name=="prize2"){
            //prize2
            if(lx.language=="en"){
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_box_E";
            }
            else{
                this.node.getChildByName("effect").getComponent(sp.Skeleton).animation="new_box";
            
            }
        }
        //复活页面(微信才有)
        if(this.node.name=="revive"){
            this.creatrBanner();
        }
        //成就页面
        if(this.node.name=="achievement"){
            this.playerInfo=cc.find("Canvas/player").getComponent("player").playerInfo;
            this.ach_content.height=0;
            this.ach_content.setPosition(0, 324);
            var achInfo=this.playerInfo.achievement;
            var newArr = [];
            for(var i=0;i<achInfo.length;i++){
                var achItem = cc.instantiate(this.achItem);
                achItem.getChildByName("desc").getComponent(cc.Label).string=ach_desc[achInfo[i][1]-1][0];  
                achItem.getChildByName("score2").getComponent(cc.Label).string=ach_desc[achInfo[i][1]-1][1];
                achItem.getChildByName("num").getComponent(cc.Label).string=ach_desc[achInfo[i][1]-1][2];
                var sprite = achItem.getChildByName("icon").getComponent(cc.Sprite);
                var icon="ach/ach_"+ach_desc[achInfo[i][1]-1][3];
                this.getSprite(icon,sprite);
                this.onRenderSocre(achItem,achInfo[i][1]%5);
                achItem.setPosition(cc.v2(0,-128*i-60));
                achItem.parent=this.ach_content;
                this.ach_content.height+=128;
                if(achInfo[i][0]=="get"){//领取效果未显示
                    cc.find("Canvas/player").getComponent("player").playerInfo.diamond+=ach_desc[achInfo[i][1]-1][2];
                    newArr.push(i);
                }
            }
            newArr.length > 0 && this.deleteItems(newArr);
        }
    },
    deleteItems : function(newArr){
        var children=this.ach_content.children;
        var count = 0;
        var isFinish = false;

        for(var i = 0; i < newArr.length; i++){
            count ++;
            isFinish = count == newArr.length ? true : false;
            this.onMoveLeft(children[newArr[i]], isFinish);
        }

        cc.find("Canvas/player").getComponent("player").playerInfo.achievement = this.playerInfo.achievement.filter(function(item, index){
            return newArr.indexOf(index) == -1;
        });

        newArr = null;

    },
    //动作左滑
    onMoveLeft:function(node, isFinish){
        var moveAction=cc.moveBy(0.4,cc.v2(-600,0));
        var call=cc.callFunc(function(){
            node.removeFromParent();
            node.destroy();
            this.ach_content.height -= 128;
            isFinish && this.onMoveUp();
        }.bind(this));
        node.runAction(cc.sequence(moveAction,call));
    },
    //动作上移
    onMoveUp:function(){
        var achItemArr=this.ach_content.children;
        for(let j=0;j<achItemArr.length;j++){
            var moveAction=cc.moveTo(0.4,cc.v2(0,-128*j-60));
            achItemArr[j].runAction(moveAction);
        }
    },
     //读取本地图片
     getSprite:function(icon,sprite){
        cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },

    //分数渲染
    onRenderSocre:function(node,type){
        switch(type){
            case 1:
                node.getChildByName("score").getComponent(cc.Label).string=ach_data.star;
            break;
            case 2:
                node.getChildByName("score").getComponent(cc.Label).string=ach_data.checkpoint;
            break;
            case 3:
                node.getChildByName("score").getComponent(cc.Label).string=ach_data.score;
            break;
            case 4:
                node.getChildByName("score").getComponent(cc.Label).string=ach_data.platform;
            break;
            case 0:
                node.getChildByName("score").getComponent(cc.Label).string=ach_data.rocket;
            break;
        }
    },

    creatrBanner:function(){
            var object={
                adUnitId:"adunit-e4255b8476385b41",
                style:{
                    left: 0, //wx.getSystemInfoSync().windowWidth wx.getSystemInfoSync().windowHeight
                    top: 0,
                    width: wx.getSystemInfoSync().screenWidth,
                }
            }
            var bannerAd=lx.createBannerAd(object);
                bannerAd.onError(err => {
                console.log(err)
            })
                bannerAd.onResize(res => {
                bannerAd.style.top = wx.getSystemInfoSync().windowHeight -bannerAd.style.realHeight;
            })
            this.bannerAd=bannerAd;
            this.bannerAd.show();   
        }
    // update (dt) {},
});

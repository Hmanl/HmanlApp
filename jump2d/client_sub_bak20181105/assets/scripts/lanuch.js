
cc.Class({
    extends: cc.Component,

    properties: {               
        content:cc.Node,
        prefabs:[cc.Prefab],
        selfNode:cc.Node,
        rng:[cc.SpriteFrame],
        stamp:[cc.SpriteFrame],        
    },

    start () {
        this.loadRobotInfo();        
        this._show();        
        wx.onMessage(data => {
            this.currScore = parseInt(data.message);
            this.friendUrl = data.url;            
            wx.getUserCloudStorage({
                keyList:['score'],
                success:this.getUserCloudStorage.bind(this),
            });
        });       
    },

    _show () {
        this.content.removeAllChildren(); 
        wx.getUserInfo({
            openIdList:['selfOpenId'],
            success:this.getUserInfo.bind(this),
        });               
    },

    getUserInfo:function(info){
        this.userInfo = info.data[0];
        wx.getFriendCloudStorage({
            keyList:['score','avatar4'],
            success:this.getFriendCloudStorage.bind(this),            
        });          
    },

    getFriendCloudStorage:function(info){    
        console.log("info ",info);
        if(info.length <= 0) return;      
        for(var k = 0; k < info.data.length-1; k++){
            for(var j = 0;j < info.data.length-1-k; j++){ 
                var score = parseInt(info.data[j].KVDataList[0].value);
                var score2 = parseInt(info.data[j+1].KVDataList[0].value);                
                if(score<score2){
                    var temp = info.data[j+1];
                    info.data[j+1] = info.data[j];
                    info.data[j] = temp;
                } 
            
            }
        }

        for(var i = 0;i < info.data.length;i++){
            var panel = null;
            (i+2)%2 == 0?panel = cc.instantiate(this.prefabs[0]):panel = cc.instantiate(this.prefabs[1]);
            this.writeInfo(panel,info.data[i],i);                           
            if(info.data[i].nickname == this.userInfo.nickName){
                this.writeInfo(this.selfNode,info.data[i],i);
            }
            panel.parent = this.content;           
        }
    },

    writeInfo(node,info,i){        
        var sprite = node.getChildByName("avatar").getComponent(cc.Sprite);
        this.createImage(sprite,info.avatarUrl);
        node.getChildByName("name").getComponent(cc.Label).string = info.nickname;
        node.getChildByName("score").getComponent(cc.Label).string = info.KVDataList[0].value;            
        node.getChildByName("rank").getComponent(cc.Label).string = (i+1).toString();        
        if(i<3)
        node.getChildByName("rank2").getComponent(cc.Sprite).spriteFrame = this.rng[i];
        var range = Math.floor(info.KVDataList[0].value/200);
        if(range<4)
        node.getChildByName("stamp").getComponent(cc.Sprite).spriteFrame = this.stamp[range];               
        if(info.KVDataList[1]){           
            var obj = JSON.parse(info.KVDataList[1].value);        
            if(obj.type == 0){                
                var g = this.userInfo.gender;
                if(g == 0)
                g = 1;
                var robotInfo = this.robots[g - 1][obj.value];
                var sprite3 = node.getChildByName('avatar2').getComponent(cc.Sprite);
                this.setSprite(sprite3,robotInfo.avatar);            
            }else{
                var sprite2 = node.getChildByName('avatar2').getComponent(cc.Sprite);
                this.createImage(sprite2,obj.value);
            }
        }
    },

    setSprite(sprite,icon){
        cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },
    
    createImage: function(sprite, url){
        if(url){
            let image = wx.createImage();       
            image.onload = function () {
                let texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                sprite.spriteFrame = new cc.SpriteFrame(texture);                
            };
            image.src = url;
        }                
    },

    getUserCloudStorage:function(data){
        var maxScore = 0;
        if(data.KVDataList[0]){
            var maxScore = parseInt(data.KVDataList[0].value);
        }        
        if(this.currScore > maxScore){
            var obj = {
                key:"score",
                value:this.currScore.toString(),
            }
 
            var obj2 = {
                key:"avatar4",
                value:this.friendUrl,
            }
            lx.setUserCloudStorage({
                KVDataList:[obj,obj2],               
              
            });            
            this._show();
        }                     
    },

    loadRobotInfo(){
        var male = new Array();
        var female = new Array();
        this.robots = new Array(male,female);        
        this.createRobot(1,'avatar/0','無悪不作');        
        this.createRobot(0,'avatar/1','兔兔');
        this.createRobot(1,'avatar/2','佛爷');
        this.createRobot(1,'avatar/3','吧唧先生');
        this.createRobot(0,'avatar/4','小兔几');
        this.createRobot(0,'avatar/5','很酷只撩你');
        this.createRobot(1,'avatar/6','油焖大侠');
        this.createRobot(0,'avatar/7','浅浅淡淡');
        this.createRobot(0,'avatar/8','柒七');
        this.createRobot(0,'avatar/9','灯下孤影');
    },

    createRobot(type,path,nickName){    
        var robot = {
            avatar:path,
            nickName:nickName,
        };
        this.robots[type].push(robot);
    },    
    
});

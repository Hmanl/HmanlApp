cc.Class({
    extends: cc.Component,

    properties:{
        prefabs:[cc.Prefab],
        texs:[cc.SpriteFrame],
        stamp:[cc.SpriteFrame],
    },

    start () {     
        this.node.setContentSize(cc.winSize);
    },
    
    update () {
        this.createRank();
    },

    createRank(){
        if(typeof(sharedCanvas) == 'undefined'){
            if(!this.rank){
                this.rank = cc.instantiate(this.prefabs[0]);                
                this.rank.parent = this.node;                
                this.selfNode = this.rank.children[1];
                this.content = this.rank.children[0].children[1].children[0];
                lx.getUserInfo({
                    tokens:['selfToken'],
                    success:this.getUserInfo.bind(this),
                });                
            }
        }else{
            if (!this.tex) {
                this.tex = new cc.Texture2D();
            }
            this.tex.initWithElement(sharedCanvas);
            this.tex.handleLoadedTexture();
            this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    },

    getUserInfo:function(info){
        this.nickName = info[0].nick;   
        var key = lx.config.platform == "fbinstant" ? 'user_score' : "userScore";      
        lx.getFriendCloudStorage({
            key: key,
            success:this.getFriendCloudStorage.bind(this),            
        });              
    },

    getFriendCloudStorage:function(info){                   
        for(var k = 0;k<info.length-1;k++){
            for(var j = 0;j<info.length-1-k;j++){
                var score = parseInt(info[j].kvdata.value.game.score);
                var score2 = parseInt(info[j+1].kvdata.value.game.score);                
                if(score<score2){
                    var temp = info[j+1];
                    info[j+1] = info[j];
                    info[j] = temp;
                } 
            }
        }
        for(var i = 0;i < info.length;i++){
            var panel = null;
            (i+2)%2 == 0?panel = cc.instantiate(this.prefabs[1]):panel = cc.instantiate(this.prefabs[2]);
            this.writeInfo(panel,info[i],i);                           
            if(info[i].nick == this.nickName){
                this.writeInfo(this.selfNode,info[i],i);
            }
            panel.parent = this.content;           
        }
    },

    writeInfo(node,info,i){        
        var sprite = node.getChildByName("avatar").getComponent(cc.Sprite);
        this.createImage(sprite,info.headimg);
        node.getChildByName("name").getComponent(cc.Label).string = info.nick;
        node.getChildByName("score").getComponent(cc.Label).string = info.kvdata.value.game.score;            
        node.getChildByName("rank").getComponent(cc.Label).string = (i+1).toString();        
        if(i<3)
        node.getChildByName("rank2").getComponent(cc.Sprite).spriteFrame = this.texs[i];
        var range = Math.floor(info.kvdata.value.game.score/200);
        if(range<4)
        node.getChildByName("stamp").getComponent(cc.Sprite).spriteFrame = this.stamp[range];               
        // if(info.KVDataList[1]){           
        //     var obj = JSON.parse(info.KVDataList[1].value);        
        //     if(obj.type == 0){                
        //         var g = this.userInfo.gender;
        //         if(g == 0)
        //         g = 1;
        //         var robotInfo = this.robots[g - 1][obj.value];
        //         var sprite3 = node.getChildByName('avatar2').getComponent(cc.Sprite);
        //         this.setSprite(sprite3,robotInfo.avatar);            
        //     }else{
        //         var sprite2 = node.getChildByName('avatar2').getComponent(cc.Sprite);
        //         this.createImage(sprite2,obj.value);
        //     }
        // }
    },

    // setSprite(sprite,icon){
    //     cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
    //         sprite.spriteFrame = spriteFrame;
    //     });
    // },

    createImage: function(sprite, url){
        lx.utils.loadImage({
            url: url,
            success : function(image){
                var texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    // loadRobotInfo(){
    //     var male = new Array();
    //     var female = new Array();
    //     this.robots = new Array(male,female);        
    //     this.createRobot(1,'avatar/0','無悪不作');        
    //     this.createRobot(0,'avatar/1','兔兔');
    //     this.createRobot(1,'avatar/2','佛爷');
    //     this.createRobot(1,'avatar/3','吧唧先生');
    //     this.createRobot(0,'avatar/4','小兔几');
    //     this.createRobot(0,'avatar/5','很酷只撩你');
    //     this.createRobot(1,'avatar/6','油焖大侠');
    //     this.createRobot(0,'avatar/7','浅浅淡淡');
    //     this.createRobot(0,'avatar/8','柒七');
    //     this.createRobot(0,'avatar/9','灯下孤影');
    // },

    // createRobot(type,path,nickName){    
    //     var robot = {
    //         avatar:path,
    //         nickName:nickName,
    //     };
    //     this.robots[type].push(robot);
    // }, 

});


cc.Class({
    extends: cc.Component,

    properties:{
        prefabs:[cc.Prefab],
        texs:[cc.SpriteFrame],
        stamp:[cc.SpriteFrame],        
        defaultAvatar:cc.SpriteFrame,
    },

    start () { 
        this.node.setContentSize(cc.winSize);
        this.createRank();
        this.node.active = false;              
    },

    update (dt) {
        this.createRank();
    }, 

    updateRank(){
        this.content.removeAllChildren();
        lx.getFriendCloudStorage({
            key:'userScore',
            success:this.getFriendCloudStorage.bind(this),            
        });         
    },

    createRank(){        
        if(typeof(sharedCanvas) == 'undefined'){
            if(!this.rank){                
                this.rank = cc.instantiate(this.prefabs[0]);
                this.rank2 = cc.instantiate(this.prefabs[1]);
                this.rank.parent = this.node;
                this.rank2.parent = this.node;
                this.selfNode = this.rank.children[1];
                this.content = this.rank.children[0].children[1].children[0];
                lx.getUserInfo({
                    tokens:['selfToken'],
                    success:this.getUserInfo.bind(this),
                });
                this.rank2.active = false;
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

    replaceRank(bool){        
        if(bool){
            this.rank2.active = false;
            this.rank.active = true;
        }else{
            this.rank.active = false;
            this.rank2.active = true;
        }
    },

    getUserInfo:function(info){ 
        // console.log("玩家信息",info);       
        this.nickName = info[0] && info[0].nick || "You You";        
        lx.getFriendCloudStorage({
            key:'userScore',
            success:this.getFriendCloudStorage.bind(this)     
            // fail:function(res){console.log("获取好友列表失败",res)}                        
        });              
    },

    getFriendCloudStorage:function(info){    
        // console.log("好友列表",info); 
        if(info.length <= 0) return;   
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
        for(var i =0;i<info.length;i++){            
            var panel = cc.instantiate(this.prefabs[3]);
            this.writeInfo(panel,info[i],i,1);
            if(info[i].nick == this.nickName){
                this.writeInfo(this.selfNode,info[i],i,1);             
                for(var t = 0;t < 3;t++){
                    if(info[i-1+t]){
                        var array = this.rank2.children[0].children;
                        this.writeInfo(array[t],info[i-1+t],i-1+t,2);
                    }                    
                }
            }
            panel.parent = this.content;           
        }
    },

    writeInfo(node,info,i,type){       
        var sprite = node.getChildByName("avatar").getComponent(cc.Sprite);
        this.createImage(sprite,info.headimg,this.defaultAvatar);
        node.getChildByName("name").getComponent(cc.Label).string = info.nick;
        node.getChildByName("score").getComponent(cc.Label).string = info.kvdata.value.game.score;            
        node.getChildByName("rank").getComponent(cc.Label).string = (i+1).toString();
        if(i<3&& type == 1)
        node.getChildByName('rank2').getComponent(cc.Sprite).spriteFrame = this.texs[i];
        var range = Math.floor(info.kvdata.value.game.score/1000);
        if(range<3 && type == 1)
        node.getChildByName("stamp").getComponent(cc.Sprite).spriteFrame = this.stamp[range];              
    },

    createImage: function(sprite, url, defaultAvatar){
        var avatar = null;
        lx.utils.loadImage({
            url : url,
            success : function(image){
                var texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                avatar = new cc.SpriteFrame(texture);
            },
            fail : function(){
                avatar = defaultAvatar;
            },
            complete : function(){
                sprite.spriteFrame = null;
                sprite.spriteFrame = avatar;
            },
        });
    },

});

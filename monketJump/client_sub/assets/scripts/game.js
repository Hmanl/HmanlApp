

cc.Class({
    extends: cc.Component,

    properties: {
        content:cc.Node,
        prefabs:[cc.Prefab],
        selfNode:cc.Node,
        layout:[cc.Node],
        texs:[cc.SpriteFrame],
        stamp:[cc.SpriteFrame],
    },
   
    start () {
        this._show();       
        wx.onMessage(data => {
            var type = parseInt(data.type);
            switch(type){
                case 0:
                this.currScore = parseInt(data.message);                       
                wx.getUserCloudStorage({
                    keyList:['score'],
                    success:this.getUserCloudStorage.bind(this),
                });
                this.node.children[0].active = false;
                this.node.children[1].active = true;
                break;
                case 1:
                    this.node.children[0].active = false;
                    this.node.children[1].active = true;                
                break;
                case 2:
                    this.node.children[0].active = true;
                    this.node.children[1].active = false;
                break;
            }
        });
    },

    _show () {
        this.content.removeAllChildren();         
        wx.getUserInfo({
            openIdList:['selfOpenId'],
            success:this.getUserInfo.bind(this),
        });       
    },

    getFriendCloudStorage:function(info){        
        for(var k = 0;k<info.data.length-1;k++){
            for(var j = 0;j<info.data.length-1-k;j++){
                var score = parseInt(info.data[j].KVDataList[0].value);
                var score2 = parseInt(info.data[j+1].KVDataList[0].value);                
                if(score<score2){
                    var temp = info.data[j+1];
                    info.data[j+1] = info.data[j];
                    info.data[j] = temp;
                } 
            }
        }        
        for(var i =0;i<info.data.length;i++){            
            var panel = cc.instantiate(this.prefabs[1]);
            this.writeInfo(panel,info.data[i],i,1);
            if(info.data[i].nickname == this.nickname){
                this.writeInfo(this.selfNode,info.data[i],i,1);             
                for(var t = 0;t < 3;t++){
                    if(info.data[i-1+t]){
                        this.writeInfo(this.layout[t],info.data[i-1+t],i-1+t,2);                        
                    }                    
                }
            }
            panel.parent = this.content;           
        }
    },

    writeInfo(node,info,i,type){
        var sprite = node.getChildByName("avatar").getComponent(cc.Sprite);
        this.createImage(sprite,info.avatarUrl);
        node.getChildByName("name").getComponent(cc.Label).string = info.nickname;
        node.getChildByName("score").getComponent(cc.Label).string = info.KVDataList[0].value;            
        node.getChildByName("rank").getComponent(cc.Label).string = (i+1).toString();
        if(i<3&& type == 1)
        node.getChildByName('rank2').getComponent(cc.Sprite).spriteFrame = this.texs[i];
        var range = Math.floor(info.KVDataList[0].value/1000);
        if(range<3 && type == 1)
        node.getChildByName("stamp").getComponent(cc.Sprite).spriteFrame = this.stamp[range];               
    },

    getUserInfo:function(info){
        this.nickname = info.data[0].nickName;
        wx.getFriendCloudStorage({
            keyList:['score'],
            success:this.getFriendCloudStorage.bind(this),            
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
        if(this.currScore>maxScore){
            var obj = {
                key:"score",
                value:this.currScore.toString(),
            };        
            wx.setUserCloudStorage({
                KVDataList:[obj],             
            });
            this._show();
        }
    },
        
});

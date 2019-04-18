var butils = require("butils");
cc.Class({
    extends: cc.Component,

    properties: {
        defaultAvatar : cc.SpriteFrame,//默认头像
        rolename : cc.Label,
        num : cc.Label,
        avatar : cc.Sprite,//用户头像
    },

    //渲染排行榜预制
    init: function(data, index){
        this.num.string = index + 1;
        //存在用户头像
        if(data.headimg){
            butils.createImage(this.avatar, data.headimg);
        }
        //不存在用户头像 
        else {
            this.avatar.spriteFrame = this.defaultAvatar;
        }
        this.rolename.string = data.nick;
        // this.score.string = data["kvdata"]["value"]["game"]["score"];

    },

    update(){
       
    }

});

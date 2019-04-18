var butils = require("butils");
cc.Class({
    extends: cc.Component,

    properties: {

        defaultAvatar : cc.SpriteFrame,//默认头像
        theNums : cc.Label,
        rolename : cc.Label,
        avatar : cc.Sprite,//用户头像
    },

    //渲染排行榜预制
    init: function(data, index){

        //-- 名次        
        this.theNums.string = "第" + (index + 1) + "名";
        
        //存在用户头像
        if(data.headimg){
            butils.createImage(this.avatar, data.headimg);

        }
        //不存在用户头像 
        else {
            this.avatar.spriteFrame = this.defaultAvatar;
        }
        this.rolename.string = data.nick;


    


    },

    

});

var butils = require("butils");
cc.Class({
    extends: cc.Component,

    properties: {
        badgeList : [cc.SpriteFrame],//金银铜奖牌
        badge :  cc.Node,
        defaultAvatar : cc.SpriteFrame,//默认头像
        score : cc.Label,
        rolename : cc.Label,
        num : cc.Label,
        avatar : cc.Sprite,//用户头像
    },

    //渲染排行榜预制
    init: function(data, index){
        //前三名为特殊奖牌
        if(index < 3){
            this.badge.getComponent(cc.Sprite).spriteFrame = this.badgeList[index];
        } else {
            //-- 其余为数字排行
            this.badge.active = false;
            this.num.node.active = true;
            this.num.string = index + 1;
        }
        //存在用户头像
        if(data.headimg){
            butils.createImage(this.avatar, data.headimg);

        }
        //不存在用户头像 
        else {
            this.avatar.spriteFrame = this.defaultAvatar;
        }
        this.rolename.string = data.nick;
        this.score.string = data["kvdata"]["value"]["game"]["score"];

    


    },

    

});

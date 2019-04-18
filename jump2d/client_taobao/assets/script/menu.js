

cc.Class({
    extends: cc.Component,

    properties: {
        tex:[cc.SpriteFrame],     
    },   

    start () {
        this.node.getChildByName('bg').setContentSize(cc.winSize);
        this.buttonGroup = this.node.getChildByName('buttonGroup');
        this.userPanel = this.node.getChildByName('userInfo');
        this.match = this.node.getChildByName('match');
        this.exit = this.node.getChildByName('exit');
        var json = localStorage.getItem('userInfo');               
        this.userInfo = JSON.parse(json);
        this.loadRobotInfo();
        this.setUserInfo();               
    },

    setUserInfo(){
        var sprite = this.userPanel.children[0].children[0].getComponent(cc.Sprite);
        this.userPanel.children[0].children[1].getComponent(cc.Label).string = this.userInfo.nickName;
        this.createImage(sprite,this.userInfo.avatar);                
        this.userPanel.children[1].children[0].getComponent(cc.Label).string = this.userInfo.gem.toString();
    },    

    skinButton(){
        this.buttonGroup.active = false;
        var skin = this.node.getChildByName('skinPanel');
        skin.active = true;
        this.exit.active = true;
        this.currPanel = skin;        
    },

    rankButton(){
        this.buttonGroup.active = false;
        this.userPanel.active = false;
        var rank = this.node.getChildByName('subCanvas');
        rank.active = true;        
        this.exit.active = true;
        this.currPanel = rank;
    },

    matchButton(){
        this.userPanel.active = false;
        this.buttonGroup.active = false;        
        this.match.active = true;        
        var avatar = this.match.getChildByName('sub').getChildByName('avatar');
        var avatar2 = this.match.getChildByName('sub').getChildByName('avatar2');
        var aTex = this.userPanel.children[0].children[0].getComponent(cc.Sprite).spriteFrame;
        if(this.userInfo.gender == 0)
            this.userInfo.gender = 1;
        var index = Math.floor(Math.random()*this.robots[this.userInfo.gender-1].length);
        var robotInfo = this.robots[this.userInfo.gender-1][index];
        this.userInfo.gender = 1?this.setMatchInfo(avatar2,robotInfo,avatar,aTex):this.setMatchInfo(avatar,robotInfo,avatar2,aTex);
    },
    
    setMatchInfo(node,info,node2,tex){
        node2.children[0].children[0].getComponent(cc.Sprite).spriteFrame = tex;
        node2.children[1].children[0].getComponent(cc.Label).string = this.userInfo.nickName;
        var time = Math.random()*3;
        this.scheduleOnce(function(){            
            this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start';
            this.match.getChildByName('sub').getComponent(cc.Animation).play();
            cc.loader.loadRes(info.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                node.children[0].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            node.children[1].children[0].getComponent(cc.Label).string = info.nickName;
        },time);
    },

    exitButton(){
        this.userPanel.active = true;
        this.buttonGroup.active = true;
        this.currPanel.active = false;
        this.exit.active = false;        
    },

    giftButton(){
        var today = (new Date()).getTime();
        if(today - this.userInfo.date > 86400000){
            this.userInfo.date = today;
        }else{
            // wx.shareAppMessage({
            //     title: '【弹弹恋爱】神秘道具礼包！先到先得，手慢无！',
            //     imageUrl:'https://h5.lexun.com/games/wx/avatar/share2.png',                            
            // });
        }
        this.userInfo.spring += 3;
        this.userInfo.revive += 1;
        if(this.userInfo.spring >10)
            this.userInfo.spring = 10;
        if(this.userInfo.revive > 5)
            this.userInfo.revive = 5;
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo',userInfo);
    },   

    selectSkin(index){        
        if(this.userInfo.skinLocks[index]){            
            var subSkins = this.node.getChildByName('skinPanel').getChildByName('scrollView').getChildByName('view').
            getChildByName('content');
            subSkins.children[this.userInfo.skin].getChildByName('bg').getComponent(cc.Sprite).spriteFrame = this.tex[0];
            subSkins.children[index].getChildByName('bg').getComponent(cc.Sprite).spriteFrame = this.tex[1];
            this.userInfo.skin = index;
            var userInfo = JSON.stringify(this.userInfo);
            localStorage.setItem('userInfo',userInfo);
        }
    },

    unlockSkin(index,amount){        
        if(this.userInfo.skinLocks[index]){
            // wx.shareAppMessage({
            //     title: '看看我的新皮肤',
            //     imageUrl:'https://h5.lexun.com/games/wx/avatar/share2.png',                            
            // });
        }else{            
            if(this.userInfo.gem > amount){
                this.userInfo.skinLocks[index] = true;
                this.userInfo.gem -= amount;
                var subSkins = this.node.getChildByName('skinPanel').getChildByName('scrollView').getChildByName('view').
                getChildByName('content');
                subSkins.children[index].getChildByName('button').getChildByName('unlock').active = false;
                subSkins.children[index].getChildByName('button').getChildByName('share').active = true;
            }else{
                
            }
        }
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo',userInfo);
    },

    // createImage: function(sprite, url){
    //     if(url){
    //         let image = wx.createImage();       
    //         image.onload = function () {
    //             let texture = new cc.Texture2D();
    //             texture.initWithElement(image);
    //             texture.handleLoadedTexture();
    //             sprite.spriteFrame = new cc.SpriteFrame(texture);
    //         };
    //         image.src = url;
    //     }                
    // },

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

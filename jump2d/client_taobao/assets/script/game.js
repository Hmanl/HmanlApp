var seedRandom = require("seedRandom");
cc.Class({
    extends: cc.Component,

    properties: {
        blockList:[cc.Prefab],
        //audios:cc.AudioClip,
        tex:[cc.SpriteFrame],              
    },
    
    onLoad(){        
        cc.director.preloadScene("01"); 
        this.loadRobotInfo();        
        this.buttonGroup = this.node.getChildByName('buttonGroup');
        this.match = this.node.getChildByName('match');
        this.exit = this.node.getChildByName('exit');                
        var systemInfo = wx.getSystemInfoSync();
        var num = parseInt(systemInfo.SDKVersion.replace(/\./g,''));
        if(num>=201){
            wx.getSetting({
                success: function (res) {
                    var authSetting = res.authSetting
                    if (authSetting['scope.userInfo'] === true) {
                        wx.getUserInfo({                                                        
                            success:function(res2){                                
                                this.initialization(res2);
                            }.bind(this),
                        })
                    } else if (authSetting['scope.userInfo'] === false){
                        this.craeteButton();
                    } else {
                        this.craeteButton();
                    }
                }.bind(this)
            });                      
        }                            
    },

    start () {
        this.stage = this.node.getChildByName('stage');
        this.shadow = this.stage.getChildByName('shadow');
        this.player = this.stage.getChildByName('player');
        this.blockLayer = this.stage.getChildByName('blockLayer');
        this.center = cc.p(43,57);
        this.origin = cc.p(-180,-280);
        this.reset();
        this.amount = 0;
        this.dir = 1;                
    },   
    
    reset:function(){
        this.rnd = new seedRandom(123456);
        let blockNode = cc.instantiate(this.blockList[0]);        
        let block = blockNode.getComponent("block");
        blockNode.position = this.origin;
        blockNode.parent = this.blockLayer;
        this.currBlock = block;        
        this.player.position = cc.pAdd(blockNode.position,this.center);
        this.shadow.position = this.player.position;
        this.scheduleOnce(this.addBlock);
    },

    addBlock:function(){
        let n = Math.floor(this.rnd.rand() * this.blockList.length);
        let blockNode = cc.instantiate(this.blockList[n]);        
        let block = blockNode.getComponent("block");
        let distance = 200 + this.rnd.rand()  *200;        
        var direction = new cc.Vec2(Math.cos(0.556047197640118),Math.sin(0.556047197640118));
        var vec = direction.mul(distance);
        vec.x *= this.dir;               
        var pos = cc.pAdd(this.currBlock.node.position,vec);
        blockNode.position = pos;
        blockNode.parent = this.blockLayer;
        this.nextBlock = block;
        this.amount++;
        blockNode.zIndex = this.amount*-1;             
        this.scheduleOnce(this.playPress,2);
    },

    playPress:function(){
        var spine = this.player.children[0].getComponent(sp.Skeleton);
        spine.animation = "body_press";        
        this.scheduleOnce(this.playJump,0.6);            
    },

    playJump:function(){
        var spine = this.player.children[0].getComponent(sp.Skeleton);
        spine.animation = "body_stand";
        this.setJump(this.player);
        this.scheduleOnce(this.shadowPress,0.4);        
    },

    shadowPress(){
        var spine = this.shadow.children[0].getComponent(sp.Skeleton);
        spine.animation = "G_body_press";        
        this.scheduleOnce(this.shadowJump,0.6);
    },

    shadowJump(){
        var spine = this.shadow.children[0].getComponent(sp.Skeleton);
        spine.animation = "G_body_stand";
        this.setJump(this.shadow);
        this.scheduleOnce(this.next,0.4);
    },

    next:function(){
        this.updateView();
        this.currBlock = this.nextBlock;
        this.addBlock();
    },

    setJump(node){        
        var targetPos = cc.pAdd(this.nextBlock.node.position,this.center);
        let jumpAction = cc.jumpTo(0.4,targetPos,200,1);
        let rotateAction = cc.rotateBy(0.4,this.dir*360);
        var spawn = cc.spawn(jumpAction,rotateAction);        
        node.runAction(spawn);
    },

    updateView:function(){        
        let moveVector = cc.pSub(this.currBlock.node.position,this.nextBlock.node.position);
        if(this.batter2 == 0){            
            moveVector.x += 280*this.dir*-1;            
        }
        let action = cc.moveBy(0.5,moveVector);
        this.stage.runAction(action);
        var bg = this.node.getChildByName('bg');
        var vec2 = bg.position.clone();
        bg.setPosition(vec2.x%960,vec2.y%1668);        
        bg.runAction(action.clone());        
        this.optimize();
    },

    optimize:function(){
        for(var i = 0; i<this.blockLayer.children.length;i++){
            var dis = cc.pDistance(this.blockLayer.children[i].position,this.player.position);
            if(dis>1000){
                this.blockLayer.children[i].destroy();                
            }
        }
    },

    craeteButton(){
        var systemInfo = wx.getSystemInfoSync();
        let button = wx.createUserInfoButton({
            type:'text',
            text:'',
            style:{
                left: 0,
                top: 0,
                width: systemInfo.screenWidth,
                height:systemInfo.screenHeight,                    
            }
        });
        button.onTap(function(res){
            wx.getSetting({
                success: function (res2) {
                    var authSetting = res2.authSetting;
                    if (authSetting['scope.userInfo'] == true){
                        button.destroy();
                        this.initialization(res);  
                    }                   
                }.bind(this),
            });                
        }.bind(this));
    },

    initialization(res){
        var userInfo = localStorage.getItem('userInfo');
        var date = (new Date()).getTime();        
        if(userInfo){            
            userInfo = JSON.parse(userInfo);
            userInfo.avatar = res.userInfo.avatarUrl;
            userInfo.nickName = res.userInfo.nickName;
            userInfo.gender = res.userInfo.gender;
            if(!userInfo.spring)
                userInfo.spring = 0;
            if(!userInfo.revive)
                userInfo.revive = 0;
            if(!userInfo.gem)
                userInfo.gem = 0;
            if(!userInfo.skin)
                userInfo.skin = 0;
            if(!userInfo.date)
                userInfo.date = date;
            if(!userInfo.beginner)
                userInfo.beginner = 0;
            if(!userInfo.skinLocks)
                userInfo.skinLocks = [true,false,false,false,false,false,false,false,false];
        }else{                                
            userInfo = {
                spring:0,
                revive:0,
                gem:0,
                skin:0,
                date:date,
                gender:res.userInfo.gender,
                avatar:res.userInfo.avatarUrl,
                nickName:res.userInfo.nickName,
                beginner:true,
                skinLocks:[true,false,false,false,false,false,false,false,false],                
            }
        }
        if(userInfo.gender == 0)
            userInfo.gender = 1;
        userInfo = JSON.stringify(userInfo);
        localStorage.setItem('userInfo',userInfo);
        this.buttonGroup.active = true;                       
    },

    matchButton(){        
        var userInfo = localStorage.getItem('userInfo');
        userInfo = JSON.parse(userInfo);           
        //cc.audioEngine.play(this.audios,true, 0.5);
        this.match.active = true;
        this.match.getChildByName('bg').setContentSize(cc.winSize);        
        var avatar = this.match.getChildByName('sub').getChildByName('avatar');
        var avatar2 = this.match.getChildByName('sub').getChildByName('avatar2');        
        var index = Math.floor(Math.random()*this.robots[userInfo.gender-1].length);                
        var robotInfo = this.robots[userInfo.gender-1][index];
        userInfo.gender == 1?this.setMatchInfo(avatar2,robotInfo,avatar,userInfo):this.setMatchInfo(avatar,robotInfo,avatar2,userInfo);
        localStorage.setItem('robot',index);
    },
    
    setMatchInfo(node,info,node2,userInfo){
        var sprite = node2.children[0].children[0].getComponent(cc.Sprite);
        this.createImage(sprite,userInfo.avatar);
        node2.children[1].children[0].getComponent(cc.Label).string = userInfo.nickName;
        var time = Math.random()*3;        
        this.scheduleOnce(function(){
            wx.vibrateLong();            
            this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start';
            this.match.getChildByName('sub').getComponent(cc.Animation).play();
            var launchOption = wx.getLaunchOptionsSync();
            if(launchOption.query.data){
                var launch = JSON.parse(launchOption.query.data);
                var sprite2 = node.children[0].children[0].getComponent(cc.Sprite);
                this.createImage(sprite2,launch.avatar);
                node.children[1].children[0].getComponent(cc.Label).string = launch.nickName;           
            }else{
                cc.loader.loadRes(info.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                    node.children[0].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                node.children[1].children[0].getComponent(cc.Label).string = info.nickName;
            }
            //cc.audioEngine.uncache(this.audios);            
            this.scheduleOnce(function(){                
                cc.director.loadScene("01");
            },1.5);
        },time);
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

    exitButton(){        
        this.buttonGroup.active = true;
        this.currPanel.active = false;
        this.exit.active = false;        
    },

    rankButton(){
        this.buttonGroup.active = false;        
        var rank = this.node.getChildByName('subCanvas');
        rank.active = true;        
        this.exit.active = true;
        this.currPanel = rank;
    },

    giftButton(){
        var chat = this.buttonGroup.getChildByName('shareButton').children[1];        
        var userInfo = localStorage.getItem('userInfo');
        userInfo = JSON.parse(userInfo);        
        wx.shareAppMessage({
            title: '【弹弹恋爱】神秘道具礼包！先到先得，手慢无！',
            imageUrl:'https://h5.lexun.com/games/wx/avatar/share2.png',                            
        });
        userInfo.spring += 3;
        userInfo.revive += 1;
        chat.getComponent(cc.Sprite).spriteFrame = this.tex[0];
        if(userInfo.spring >10){
            userInfo.spring = 10;
            chat.getComponent(cc.Sprite).spriteFrame = this.tex[1];
        }            
        if(userInfo.revive > 5){
            userInfo.revive = 5;
            chat.getComponent(cc.Sprite).spriteFrame = this.tex[1];
        }                    
        var userInfo = JSON.stringify(userInfo);
        localStorage.setItem('userInfo',userInfo);
    },    
});

var seedRandom = require("seedRandom");

cc.Class({
    extends: cc.Component,

    properties: {        
        audios:cc.AudioClip,                              
    },

    start () { 
        this.buttonGroup = this.node.getChildByName('buttonGroup');
        this.gift = this.node.getChildByName('gift');
        this.match = this.node.getChildByName('match');
        this.exit = this.node.getChildByName('exit');
        this.mask = this.node.getChildByName('mask');
        this.node.getChildByName('bg').setContentSize(cc.winSize);
        this.mask.setContentSize(cc.winSize);
        this.count = 1; 
        this.loadRobotInfo();               
        cc.director.preloadScene("main");
        this.loadText();
        
        lx.config.set({gameid: 600});
        lx.login();
        if(typeof(sharedCanvas) == 'undefined'){
            this.lexun();
        }else{
            this.wechat();
            this.createAD(); 
        }
    },

    lexun(){
        this.buttonGroup.active = true;
        var knock =  this.node.getChildByName('knock');
        if(cc.isValid(knock))
        knock.destroy();
        this.buttonGroup.getChildByName('gameBox').active = false;
        this.buttonGroup.getChildByName('box3').active = false;
        this.buttonGroup.getChildByName('shareButton').active = false;
        var userInfo = localStorage.getItem('userInfo2');
        if(userInfo){
            this.userInfo = JSON.parse(userInfo);
        }else{
            lx.getUserInfo({
                tokens:['selfToken'],
                success:function(info){
                    this.userInfo = {
                        spring:0,
                        revive:0,
                        gem:0,
                        skin:0,
                        date:111,
                        gender:info[0].gender,
                        avatar:info[0].headimg,
                        nickName:info[0].nick,
                        beginner:0, 
                    };
                    if(this.userInfo.gender == 0)
                    this.userInfo.gender = 1;                    
                }.bind(this),                
            });
        }
    },
    
    matchButton(){        
        cc.audioEngine.playMusic(this.audios,false);
        this.buttonGroup.active = false;
        this.match.active = true;
        this.match.getChildByName('bg').setContentSize(cc.winSize);        
        var avatar = this.match.getChildByName('sub').getChildByName('avatar');
        var avatar2 = this.match.getChildByName('sub').getChildByName('avatar2');                
        var index = Math.floor(Math.random()*this.robots[this.userInfo.gender-1].length);                
        var robotInfo = this.robots[this.userInfo.gender-1][index];
        localStorage.setItem('robot',index);
        if(this.vedio)
        this.vedio.offClose();        
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo2',userInfo);    
        this.userInfo.gender == 1?this.setMatchInfo(avatar2,robotInfo,avatar,this.userInfo):
        this.setMatchInfo(avatar,robotInfo,avatar2,this.userInfo);                 
    },
    
    setMatchInfo(node,info,node2,userInfo){
        var sprite = node2.children[0].children[0].getComponent(cc.Sprite);
        this.createImage(sprite,userInfo.avatar);
        node2.children[1].children[0].getComponent(cc.Label).string = userInfo.nickName;
        var time = Math.random()*3;    
        sprite.scheduleOnce(function(){                      
            this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start';
            this.match.getChildByName('sub').getComponent(cc.Animation).play();
            var sprite2 = node.children[0].children[0].getComponent(cc.Sprite);
            var label2 = node.children[1].children[0].getComponent(cc.Label);
            if(typeof(sharedCanvas) == 'undefined'){
                cc.loader.loadRes(info.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                    if(cc.isValid(sprite2.node))
                    sprite2.spriteFrame = spriteFrame;
                });
                label2.string = info.nickName;
            }else{
                wx.vibrateLong();
                var launchOption = wx.getLaunchOptionsSync();            
                if(launchOption.query.data){
                    console.log(launchOption.query);            
                    var launch = JSON.parse(launchOption.query.data);                
                    this.createImage(sprite2,launch.avatar);
                    label2.string = launch.nickName;           
                }else{
                    cc.loader.loadRes(info.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                        if(cc.isValid(sprite2.node))
                        sprite2.spriteFrame = spriteFrame;
                    });
                    label2.string = info.nickName;
                }
            }
            sprite.scheduleOnce(function(){                
                cc.director.loadScene("main");
            },1.5);
        }.bind(this),time);
    },
    
    loadRobotInfo(){        
        this.robots = [[],[]];        
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
        if(typeof(sharedCanvas) == 'undefined'){
            lx.utils.loadImage({
                url: url,
                success : function(image){
                    var texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    sprite.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }else{
            if(url){
                let image = wx.createImage();       
                image.onload = function () {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    if(cc.isValid(sprite.node))
                    sprite.spriteFrame = new cc.SpriteFrame(texture);
                };
                image.src = url;
            }
        }        
    },

    exitButton(){        
        this.buttonGroup.active = true;
        if(cc.isValid(this.currPanel))
        this.currPanel.active = false;
        this.exit.active = false;
        this.mask.active = false;   
    },

    rankButton(){
        this.mask.active = true;
        this.buttonGroup.active = false;        
        var rank = this.node.getChildByName('subCanvas');
        rank.active = true;        
        this.exit.active = true;
        this.currPanel = rank;
    },

    skinButton(){
        this.buttonGroup.active = false;
        var skin = this.node.getChildByName('skin');
        skin.active = true;
        this.exit.active = true;
        this.currPanel = skin;
    },

    giftButton(){
        var date = Math.floor((new Date()).getTime() / 86400000);
        if(date - this.userInfo.date > 0){
            this.count --;
            this.addItem();
            if(this.count == 0)
            this.userInfo.date = date;
        }else{
            this.buttonGroup.active = false;
            this.gift.active = true;
            this.currPanel = this.gift;
            this.mask.active = true;
        }        
    },

    displayAD(){        
        this.vedio ? this.vedio.show():this.setTooltip('版本过低无法观看广告');        
    },

    navigate(){
        wx.navigateToMiniProgram({
            appId:'wxf925857e2463adc5',
            path:'pages/index/index',
        });
    },

    navigate2(){
        wx.navigateToMiniProgram({
            appId:'wxe8a45bddfbf0b97b',
        });
    },

    createAD(){
        var systemInfo = wx.getSystemInfoSync();
        var num = parseInt(systemInfo.SDKVersion.replace(/\./g,''));
        if(num >= 210){
            this.vedio = wx.createRewardedVideoAd({adUnitId:'adunit-f2b4d92431c80b1e'});
            this.vedio.onClose(function(res){
                res.isEnded ? this.addItem() : this.setTooltip('没有观看完整广告,无法获得道具');                               
            }.bind(this));
        }
    },

    addItem(){
        this.userInfo.spring += 3;
        this.userInfo.revive += 1;
        if(this.userInfo.spring >10)
            this.userInfo.spring = 10;
        if(this.userInfo.revive > 5)
            this.userInfo.revive = 5;
        this.userInfo.spring < 10 || this.userInfo.revive < 5?
        this.setTooltip('恭喜获得超级道具*3，天使复活*1'):this.setTooltip('道具已到达上限，用完再来吧~');
        this.exitButton();        
    },

    setTooltip(str){        
        var node = this.node.getChildByName('label');       
        if(!node.activeInHierarchy){
            node.active = true;              
            node.children[0].getComponent(cc.Label).string = str;
            var finished = cc.callFunc(function(){
                node.setPosition(-700,0);
                node.active = false;
            },this)            
            var action = cc.sequence(                
                cc.moveBy(0.3,cc.v2(700,0)),
                cc.delayTime(2),
                cc.moveBy(0.3,cc.v2(700,0)),
                finished                
            );
            node.runAction(action);
        }
    },
    
    wechat(){
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
        var knock =  this.node.getChildByName('knock');
        if(cc.isValid(knock))
        knock.destroy();
        var userInfo = localStorage.getItem('userInfo2');        
        var date = Math.floor((new Date()).getTime() / 86400000);        
        if(userInfo){
            this.userInfo = JSON.parse(userInfo);
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
                beginner:0,
                skinLocks:[true,false,false,false,false,false,false,false,false],                
            }
            if(userInfo.gender == 0)
                userInfo.gender = 1;
            this.userInfo = userInfo; 
        }
        this.buttonGroup.active = true;                                     
    },

    loadText(){
        this.shareText = [            
            {
                str:'双人版跳一跳，为您匹配最佳伴侣',
                url:'https://h5.lexun.com/games/wx/avatar/share4.jpg',
            },        
            {
                str:'你是甜豆腐脑派还是咸豆腐脑派？',
                url:'https://h5.lexun.com/games/wx/avatar/g01.jpg',
            },                       
            {
                str:'本宫是最美的，连散步都美！最近中了延禧攻略的毒！',
                url:'https://h5.lexun.com/games/wx/avatar/g03.jpg',
            },
            {
                str:'帮我砍海底世界的门票，就差你一刀了，拜托拜托~',
                url:'https://h5.lexun.com/games/wx/avatar/g05.jpg',
            },
            {
                str:'[有人@你]拼手气红包，最高可得60元，第五个拆开的红包最大！',
                url:'https://h5.lexun.com/games/wx/avatar/g06.jpg',
            },
            {
                str:'快来测测你身边的人谁在暗恋你！',
                url:'https://h5.lexun.com/games/wx/avatar/g07.jpg',
            },
            {
                str:'我刚买了一套房还是别墅，你要来看看吗？',
                url:'https://h5.lexun.com/games/wx/avatar/g08.jpg',
            }, 
            {
                str:'游戏玩到888，明年一定发！',
                url:'https://h5.lexun.com/games/wx/avatar/g09.jpg',
            },
            {
                str:'这是哥哥玩游戏赚的第三台跑车了，你最近如何？',
                url:'https://h5.lexun.com/games/wx/avatar/g10.jpg',
            }, 
            {
                str:'这些面相一夜暴富的几率很大，特别是最后一种！',
                url:'https://h5.lexun.com/games/wx/avatar/g11.jpg',
            },
            {
                str:'自从称霸这个游戏，老板跪着喊我带他!',
                url:'https://h5.lexun.com/games/wx/avatar/g12.jpg',
            },
            {
                str:'自从玩了这个游戏，老师再也不敲我头了！',
                url:'https://h5.lexun.com/games/wx/avatar/g13.jpg',
            },
            {
                str:'我在这个游戏玩了1888888分，王X聪都超不过我！',
                url:'https://h5.lexun.com/games/wx/avatar/g14.jpg',
            }   
        ];
    },

});
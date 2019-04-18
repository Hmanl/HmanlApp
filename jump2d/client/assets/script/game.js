var seedRandom = require("seedRandom");

cc.Class({
    extends: cc.Component,

    properties: {        
        audios:cc.AudioClip, 
        home:cc.Node,
        rankAni:cc.Node,
        spine:cc.Node,
        layout : cc.Node,
    },

    onLoad(){
        lx.i18n = require('LanguageData');
        if(lx.config.platform=="fbinstant"){
            lx.i18n.init('en');
            lx.language="en";
        }
        else{
            lx.i18n.init('zh');
            lx.language="zh";
        }
        var canvas = this.node.getComponent(cc.Canvas);
        if(!cc.sys.isMobile){            
            canvas.fitHeight = true;
        }
    },

    start () { 
        // this.buttonGroup = this.layout.getChildByName('buttonGroup');
        this.buttonGroup = this.layout.getChildByName('buttonGroup');
        this.gift = this.layout.getChildByName('gift');
        this.match = this.layout.getChildByName('match');
        this.exit = this.layout.getChildByName('exit');
        this.mask = this.layout.getChildByName('mask');
        // this.layout.getChildByName('bg').setContentSize(cc.winSize);
        this.layout.getChildByName('bg').setContentSize(cc.winSize);
        this.mask.setContentSize(cc.winSize);
        this.count = 1; 
        this.loadRobotInfo();               
        cc.director.preloadScene("main");
        this.loadText();
        
        var adUnitId = "";
        //版本高此方法才存在
        if(lx.showRewardedVideoAd){
            switch(lx.config.platform){
                case "fbinstant":
                    adUnitId = "1463699723764796_1463740947094007";
                    break;
                case "weixin":
                    adUnitId = "adunit-f2b4d92431c80b1e";
                    break;
            }
        }

        lx.config.set({
            gameid: 100300,
            adUnitId: adUnitId,
        });
        
        var parm = {
            scope: "scope.userInfo",

            success:function(res){         
                //弹出乐讯登陆框
                    lx.login({
                    success:function(res){
                        if(typeof(sharedCanvas) == 'undefined'){
                            this.lexun();
                            this.judgeSpine();
                        }else{
                            this.wechat();
                        }
                
                    }.bind(this)

                });
            }.bind(this),

            fail:function(){
                lx.authorize(parm);
            },
        };

        lx.authorize(parm);
        


    },

    //主页动画判断
    judgeSpine:function(){
        if(lx.language=="zh"){
            //中文
            this.home.getComponent(sp.Skeleton).animation = "button_start";
            this.rankAni.getComponent(sp.Skeleton).animation = "button_rankings";
            
        }
        else{
            //英文
            this.home.getComponent(sp.Skeleton).animation = 'button_start_E';
            this.rankAni.getComponent(sp.Skeleton).animation = "button_rankings_E";
        }
    },

    lexun(){
        this.buttonGroup.active = true;
        var knock =  this.layout.getChildByName('knock');
        if(cc.isValid(knock))
        knock.destroy();
        this.buttonGroup.getChildByName('gameBox').active = false;
        this.buttonGroup.getChildByName('box3').active = false;
        this.buttonGroup.getChildByName('shareButton').active = false;
        var userInfo = lx.getUserInfoSync();
        this.userInfo = {
            spring:0,
            revive:0,
            gem:0,
            skin:0,
            date:111,
            gender: userInfo.gender,
            avatar: userInfo.headimg,
            nickName: userInfo.nick,
            beginner:0, 
        };
        if(this.userInfo.gender == 0)
        this.userInfo.gender = 1;     
        
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

        if(lx.language=="zh"){
             //中文
             this.spine.getComponent(sp.Skeleton).animation = 'matching_loop';      
        }
        else{
             //英文
             this.spine.getComponent(sp.Skeleton).animation = 'matching_loop_E';    
        }

        sprite.scheduleOnce(function(){                      
         
            if(lx.language=="zh"){
                //中文
                this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start';                
            }                
            else{
                //英文
                this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start_E';                
            }
            
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
        this.createRobot(1,'avatar/0',lx.i18n.t("label_text.robotId_1"));        
        this.createRobot(0,'avatar/1',lx.i18n.t("label_text.robotId_2"));
        this.createRobot(1,'avatar/2',lx.i18n.t("label_text.robotId_3"));
        this.createRobot(1,'avatar/3',lx.i18n.t("label_text.robotId_4"));
        this.createRobot(0,'avatar/4',lx.i18n.t("label_text.robotId_5"));
        this.createRobot(0,'avatar/5',lx.i18n.t("label_text.robotId_6"));
        this.createRobot(1,'avatar/6',lx.i18n.t("label_text.robotId_7"));
        this.createRobot(0,'avatar/7',lx.i18n.t("label_text.robotId_8"));
        this.createRobot(0,'avatar/8',lx.i18n.t("label_text.robotId_9"));
        this.createRobot(0,'avatar/9',lx.i18n.t("label_text.robotId_10"));        
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
                    if(image){
                        var texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        sprite.spriteFrame = new cc.SpriteFrame(texture);
                    }
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
        var rank = this.layout.getChildByName('subCanvas');
        rank.active = true;        
        this.exit.active = true;
        this.currPanel = rank;
    },

    skinButton(){
        this.buttonGroup.active = false;
        var skin = this.layout.getChildByName('skin');
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

    addItem(){
        this.userInfo.spring += 3;
        this.userInfo.revive += 1;
        if(this.userInfo.spring >10)
            this.userInfo.spring = 10;
        if(this.userInfo.revive > 5)
            this.userInfo.revive = 5;
        this.userInfo.spring < 10 || this.userInfo.revive < 5?
        this.setTooltip(lx.i18n.t("label_text.Resurrection_1")):this.setTooltip(lx.i18n.t("label_text.Resurrection_2"));
        this.exitButton();        
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


    setTooltip(str){        
        var node = this.layout.getChildByName('label');       
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
        var knock =  this.layout.getChildByName('knock');
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
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/wx/avatar/share4.jpg',
            },        
            {
                str:lx.i18n.t("label_text.shareText2"),
                url:'https://h5.lexun.com/games/wx/avatar/g01.jpg',
            },                       
            {
                str:lx.i18n.t("label_text.shareText3"),
                url:'https://h5.lexun.com/games/wx/avatar/g03.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText4"),
                url:'https://h5.lexun.com/games/wx/avatar/g05.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText5"),
                url:'https://h5.lexun.com/games/wx/avatar/g06.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText6"),
                url:'https://h5.lexun.com/games/wx/avatar/g07.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText7"),
                url:'https://h5.lexun.com/games/wx/avatar/g08.jpg',
            }, 
            {
                str:lx.i18n.t("label_text.shareText8"),
                url:'https://h5.lexun.com/games/wx/avatar/g09.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText9"),
                url:'https://h5.lexun.com/games/wx/avatar/g10.jpg',
            }, 
            {
                str:lx.i18n.t("label_text.shareText10"),
                url:'https://h5.lexun.com/games/wx/avatar/g11.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText11"),
                url:'https://h5.lexun.com/games/wx/avatar/g12.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText12"),
                url:'https://h5.lexun.com/games/wx/avatar/g13.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText13"),
                url:'https://h5.lexun.com/games/wx/avatar/g14.jpg',
            }   
        ];
            //英文
        this.shareText_E = [            
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },        
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },                       
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            }, 
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            }, 
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText1"),
                url:'https://h5.lexun.com/games/fb/avatar/g01.jpg',
            }    
        ];
        
    },

});

cc.Class({
    extends: cc.Component,
    properties: {
        tex:[cc.SpriteFrame],        
        audios:[cc.AudioClip],
        prefabs:[cc.Prefab],
        logo:cc.Node,
        startbutton:cc.Node,
        skinbutton:cc.Node,
        rankbutton:cc.Node,
        trySprite:[cc.SpriteFrame],
        tryButton:cc.Sprite,
        trybuttonSprite:[cc.SpriteFrame],
        skinSeatSprite:[cc.SpriteFrame],
        getskinPopup:cc.Node, //得到皮肤详情
        tip:cc.Node,//分享获得提示
        buffTip:cc.Node,
        preScene:cc.Node,
    },

    onLoad(){
        // cc.director.setDisplayStats(false);
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
        var starBuff=localStorage.getItem('starBuff');
        if(starBuff){
            if(starBuff==true){
                cc.find("Canvas/buff").active=false;
            }
            if(starBuff==false){
                cc.find("Canvas/buff").active=true;
            }
        }
        else{
            cc.find("Canvas/buff").active=true;
        }

        //弹banner广告
        if(lx.createBannerAd){
            this.creatrBanner();
        }

        //main场景预加载
        this.scene_tag=false;
        this.onclick=false;
        //场景预加载
        this.preLoadScene();
    },


    //场景预加载
    preLoadScene:function(){
        cc.director.preloadScene("main", function () {
            this.scene_tag=true;
            cc.log("场景加载完成")
        }.bind(this));
    },

    start(){
        cc.director.preloadScene('main');
        this.node.getChildByName('bg').getChildByName("bg4").setContentSize(cc.winSize);
        this.node.getChildByName('bg').getChildByName('bg3').setContentSize(cc.winSize);
        this.menu = this.node.getChildByName('menu');
        this.UI = this.node.getChildByName('UI');
        var light = this.UI.getChildByName('light');
        //光动画
        var action = cc.repeatForever(cc.rotateBy(10,360));
        light.runAction(action);
        //鱼动画
        var fsp = this.node.getChildByName('bg').getChildByName('fishSpine');
        var finished = cc.callFunc(function(){fsp.setPosition(500,-158)},this);
        var action2 = cc.repeatForever(cc.sequence(
            cc.moveTo(2.5,cc.v2(-660,-158)),finished
        ))
        fsp.runAction(action2);
        //音乐控制
        cc.audioEngine.setMaxAudioInstance(10);
        cc.audioEngine.playMusic(this.audios[0],true);

        this.node.getChildByName('mask2').setContentSize(cc.winSize);
        this.node.getChildByName('getSkin').getChildByName('bg').setContentSize(cc.winSize);
        this.order = [];
        this.queue = [];     
        this.cv = 113;
        this.lock = true;
        this.iCount = "";

        var adUnitId = "";

        //版本高此方法才存在
        if(lx.showRewardedVideoAd){
            switch(lx.config.platform){
                case "fbinstant":
                    adUnitId = "372393436633755_391851504687948";
                    break;
                case "weixin":
                    adUnitId = "adunit-f5ecfa7334c69034";
                    break;
            }
        }

        lx.config.set({
            gameid: 100500,
            adUnitId: adUnitId,
            version:"1.1.2"
        });
        
        var parm = {
            scope: "scope.userInfo",

            success:function(res){         
                //弹出乐讯登陆框
                    lx.login({
                    success:function(res){
                        var subCanvas = this.node.getChildByName('subCanvas'); 
                        subCanvas.active = true;
                        if(typeof(sharedCanvas) == 'undefined'){//乐讯 facebook
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

        if(typeof(sharedCanvas) == 'undefined'){
            lx.authorize(parm);
        }else{
            this.wechat();
        }
        
        this.changeSkinPop();
    },

    changeSkinPop:function(){
        var panel = this.node.getChildByName('getSkin');          
        if(lx.language == "en"){
            panel.getChildByName("effect").getComponent(sp.Skeleton).animation = "new_skin_E";
        }else{
            panel.getChildByName("effect").getComponent(sp.Skeleton).animation = "new_skin";
        }
        panel.getChildByName("text").getComponent(cc.Label).string = lx.i18n.t("label_text.getSkinTip");
        panel.getChildByName("use").getChildByName("text").getComponent(cc.Label).string = lx.i18n.t("label_text.getSkinLeft");
        panel.getChildByName("parade").getChildByName("text").getComponent(cc.Label).string = lx.i18n.t("label_text.getSkinRight");
        panel.getChildByName("jumpOut").getComponent(cc.Label).string = lx.i18n.t("label_text.jumpOut");
    },
    //主页动画判断
    judgeSpine:function(){
        if(lx.language=="zh"){
            //中文
            this.logo.getComponent(sp.Skeleton).animation = "logo";
            this.startbutton.getComponent(sp.Skeleton).animation = "button";
            this.skinbutton.getComponent(sp.Skeleton).animation = "B_skin";
            this.rankbutton.getComponent(sp.Skeleton).animation = "B_ranking";
        }
        else{
            //英文
            this.logo.getComponent(sp.Skeleton).animation = 'logo_E';
            this.startbutton.getComponent(sp.Skeleton).animation = "button_E";
            this.skinbutton.getComponent(sp.Skeleton).animation = "B_skin_E";
            this.rankbutton.getComponent(sp.Skeleton).animation = "B_ranking_E";
        }
    },  

    //乐讯初始化
    lexun(){       
        var knock = this.node.getChildByName('knock');
        if(cc.isValid(knock)){
            knock.destroy();
        }
        this.initialization();  //初始化玩家数据            
        this.displayMenu(); //初始化主页星星
        this.loadText();   //初始化全局数据
        this.menu.getChildByName('shareButton').active = false;
    },

    //微信初始化
    wechat(){        
        var systemInfo = wx.getSystemInfoSync();
        var num = parseInt(systemInfo.SDKVersion.replace(/\./g,''));
        if(num >= 201){
            wx.getSetting({
                success: function (res) {
                    var authSetting = res.authSetting
                    if (authSetting['scope.userInfo'] === true) {
                        wx.getUserInfo({                                                        
                            success:function(res2){
                            this.accept(res2);
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
                        this.accept(res);
                    }                   
                }.bind(this),
            });                
        }.bind(this));
    },

    accept(res){
        this.initialization();   
        this.playerInfo.nickName = res.userInfo.nickName;
        var knock = this.node.getChildByName('knock');
        if(cc.isValid(knock))
        knock.destroy();        
        this.loadText();
        this.checkVersion();//
        this.checkQuery();
        this.displayQueue();                  
    },

    //初始化玩家数据
    initialization(){        
        var playerInfo = localStorage.getItem('playerInfo5');
        var date = Math.floor((new Date()).getTime() / 86400000);
        if(playerInfo){            
            this.playerInfo = JSON.parse(playerInfo);
            //成就
            if(this.playerInfo.achievement){
                this.playerInfo.achievement=[["unget",1],["unget",2],["unget",3],["unget",4],["unget",5],["unget",6],["unget",7],["unget",8],["unget",9],["unget",10]];
            }
            //强制清空皮肤
            this.playerInfo.skinLocks=[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            this.playerInfo.tryskin = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            var playerInfo = JSON.stringify(this.playerInfo);
            localStorage.setItem('playerInfo5',playerInfo);
            if(!this.sameDayLogin(this.playerInfo.loginTime)){
                this.playerInfo.tryskin = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                var playerInfo = JSON.stringify(this.playerInfo);
                localStorage.setItem('playerInfo5',playerInfo);
            }           
        }else{       
            playerInfo = {
                nickName:'思念星空',
                diamond:0,
                date:date,
                share:0,
                skin:0,
                revive:3,
                star:10000,     
                skinLocks:[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                tryskin:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                tryState:0,
                loginTime : new Date().getTime(),
                achievement:[["unget",1],["unget",2],["unget",3],["unget",4],["unget",5],["unget",6],["unget",7],["unget",8],["unget",9],["unget",10]],
            }
            this.playerInfo = playerInfo;
        }       
        //皮肤分享信息
        var shareInfo=localStorage.getItem('shareInfo');
        if(shareInfo){
        }
        else{
            shareInfo={
                "share_1":1,
                "share_2":5,
                "share_3":10,
            }
            localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
        }   
        //buff增益(星星增益)
        var starBuff=localStorage.getItem('starBuff');
        if(starBuff){
        }
        else{
            localStorage.setItem('starBuff',false);
        }   
    },

     // 判断是否同一天登录
     sameDayLogin : function(lastLoginTime){
        var nowLoginTime = new Date();
        if(nowLoginTime.toDateString() === new Date(lastLoginTime).toDateString()){//转为日期格式
            return true;
        } else if (nowLoginTime > new Date(lastLoginTime)){
            return false;
        }
    },
    

    checkVersion(){   
        if(!this.sameDayLogin(this.playerInfo.loginTime)){//不同一天
            if(!isanno){
                this.aType = true;
                this.queue.push(1);
            }            
        }           
    },

    checkQuery(){
        var launchOption = wx.getLaunchOptionsSync();
        console.log(launchOption);
        if(launchOption.query.data){            
            this.launch = JSON.parse(launchOption.query.data);
            this.queue.push(2);
        }
    },
    
    displayQueue(){
        if(this.queue.length > 0){
            this.node.getChildByName('mask2').active = true;
            this.queue[0] == 1 ? this.displayAnnouncement():this.displayGift();
        }else{
            this.displayMenu(); 
        }               
    },

    //弹框提示
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

    //得到i皮肤,改变数据信息
    skinQueue(i){
        if(!this.playerInfo.skinLocks[i]){ 
            this.playerInfo.skinLocks[i] = 1;           
            var index = this.order.push(i);
            if(index == 1)
            for(var j = 0; j < this.playerInfo.skinLocks.length;j++){
                if(this.playerInfo.skinLocks[j] == 2 ){ 
                    this.playerInfo.skinLocks[j] = 1;
                }
                if(this.playerInfo.tryskin[j] == 1 ){ 
                    this.playerInfo.tryskin[j] = 0;
                }
            } 
            this.getNewSkin(i);                    
        }       
    },

    //弹出新皮肤框
    getNewSkin(i){        
        var panel = this.node.getChildByName('getSkin');           
        this.setSkeletonData(panel.children[2],"playerSpine/"+playerSpine[i],skins[i][2],null,1,true);  
        this.iCount = i;
        panel.active = true;        
        var finished = cc.callFunc(function(){
            panel.opacity = 255;            
            this.order.splice(0,1);
            if(this.order[0]){
                this.getNewSkin(this.order[0]);
            }                                              
        },this);
        panel.runAction(finished);    
    },

    //弹出试穿皮肤框
    getTrySkin(i){
        var panel = this.node.getChildByName('getTrySkin');           
        this.setSkeletonData(panel.children[2],"playerSpine/"+playerSpine[i],skins[i][2],null,1,true);  
        this.iCount = i;
        panel.active = true;        
        var finished = cc.callFunc(function(){
            panel.opacity = 255;            
            this.order.splice(0,1);
            if(this.order[0]){
                this.getNewSkin(this.order[0]);
            }                                              
        },this);
        panel.runAction(finished);    
    },

    displayPrize(){
        var node = this.node.getChildByName('prize');
        this.playerInfo.revive += 3;
        node.scale = 0.3;
        node.active = true;
        var action = cc.scaleTo(0.25,1);
        node.runAction(action);
        this.currPanel = node;
    },

    //游戏公告
    displayAnnouncement(){
        var anno = this.node.getChildByName('anno');        
        if(this.aType){
            this.playerInfo.revive += 2;
            anno.getChildByName('count').getComponent(cc.Label).string = '2';
            localStorage.setItem('version',this.cv);
        }else{
            var star =  111 * (Math.ceil(Math.random() * 9));
            this.playerInfo.star += star;
            anno.getChildByName('count').getComponent(cc.Label).string = star.toString();
            anno.getChildByName('content').active = false;
            anno.getChildByName('bg').getComponent(cc.Sprite).spriteFrame = this.tex[0];            
        }
        anno.active = true;
    },

    //游戏礼包
    displayGift(){
        var node = this.node.getChildByName('gift');
        node.getChildByName('nickName').getComponent(cc.Label).string = this.launch.nickName;
        if(this.launch.type == 0){            
            this.playerInfo.revive += 3; 
        }else{
            node.getChildByName('bg').getComponent(cc.Sprite).spriteFrame = this.tex[1];            
            var star =  111 * (Math.ceil(Math.random() * 9));

            this.playerInfo.star += star;
            
            node.getChildByName('star').getComponent(cc.Label).string = star.toString();
            node.getChildByName('star').active = true;
            var diamond = Math.ceil(Math.random() * 89) + 10;
        
            this.playerInfo.diamond += diamond;
            
            node.getChildByName('diamond').getComponent(cc.Label).string = diamond.toString();
            node.getChildByName('diamond').active = true;
        }
        node.active = true;
    },

    displayMenu(){
        this.menu.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star.toString();
        this.menu.active = true;
    },
    
    //游戏开始
    startButton(){   
        if(this.scene_tag==true){
            if(this.bannerAd){
                this.bannerAd.destroy();
            }
            var playerInfo = JSON.stringify(this.playerInfo);
            localStorage.setItem('playerInfo5',playerInfo);
            cc.director.loadScene("main");
        }
        else{
            this.onclick=true;
            this.preScene.active=true;
        }
    },

    skinButton(){        
        console.log("调用渲染");
        if(this.bannerAd){
            this.bannerAd.destroy();
        }
        this.menu.active = false;
        this.node.getChildByName('exit').active = true;        
        var skinPanel = this.node.getChildByName('skinPanel');
        skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
        skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
        for(var i = 0;i < this.playerInfo.skinLocks.length;i++){

            var node = cc.instantiate(this.prefabs[0]);
            node.parent = skinPanel.children[4].children[0];
            var sprite = node.getChildByName('tex').getComponent(cc.Sprite);
            var sprite2 = node.getChildByName('button').getComponent(cc.Sprite);
            var stat = this.playerInfo.skinLocks[i];
            if(lx.language=="en"){
                if(stat!=0){
                    stat+=2;
                }
            }
            var icon = 'skin/' + (i + 1);
            var icon2 = 'button/' + stat;
            this.setSpriteFrame(icon,sprite);
            this.setSpriteFrame(icon2,sprite2);
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "game";
            clickEventHandler.handler = 'selectSkin';
            clickEventHandler.customEventData = i;
            var button = node.getChildByName('button').getComponent(cc.Button);
            button.clickEvents.push(clickEventHandler);
            node.getChildByName("try").active = false;
            //底座渲染
            this.setSkinSeat(node,this.skinType[i]);
            if(stat){
                node.getChildByName('label').active = false;
                node.getChildByName('start').active = false;
                node.getChildByName('diamond').active = false;
            }else{
                node.getChildByName('label').getComponent(cc.Label).string = this.skinPrice[i];
                switch(this.skinType[i]){
                    case 0:
                    node.getChildByName('start').active = true;
                    node.getChildByName('diamond').active = false;
                    break;
                    case 1:
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = true; 
                    break
                    case 2:
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    break
                }
            }           
        }        
        !skinPanel.active && (skinPanel.active = true);
        this.tryFlag = true; // 免费试穿标识
        this.currPanel = skinPanel
    },

    //设置底座
    setSkinSeat:function(node,skinType){
        switch(skinType){
            case 0: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[0]; 
            break;
            case 1: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[1]; 
            break;
            case 2: node.getChildByName("seat").getComponent(cc.Sprite).spriteFrame = this.skinSeatSprite[2]; 
            break;
        }
    },

    setSpriteFrame:function(icon,sprite){
        cc.loader.loadRes(icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },

    rankButton(){
        if(this.bannerAd){
            this.bannerAd.destroy();
        }
        this.menu.active = false;
        this.node.getChildByName('exit').active = true;
        var subCanvas = this.node.getChildByName('subCanvas'); 
        subCanvas.active = true;
        typeof(sharedCanvas) == 'undefined' ? subCanvas.getChildByName('more').active = false : wx.postMessage({type:'2'});       
        this.currPanel = subCanvas;
    },

    exitButton(){
        this.displayMenu();
        if(this.currPanel){
            this.currPanel.active = false;
            var skinPanel = this.node.getChildByName('skinPanel');
            if(this.currPanel == skinPanel){
                var content = skinPanel.getChildByName('view').children[0];
                while(content.children.length > 0){
                    content.children[0].destroy();
                    content.children[0].removeFromParent();                             
                }
            }
        }                    
        this.node.getChildByName('exit').active = false;
        this.node.getChildByName('mask2').active = false;       
    },

    exitQueue(){
        this.queue[0] == 1 ? this.node.getChildByName('anno').active = false : this.node.getChildByName('gift').active = false;        
        this.queue.splice(0,1);
        if(this.queue.length > 0){
            this.displayQueue();
        }else{
            this.node.getChildByName('mask2').active = false;
            this.displayMenu();
        }
    },

    anginButton(event){        
        this.displayAD();
        event.target.getComponent(cc.Button).interactable = false;
    },

    //点击视频
    displayAD(){
        if(!lx.config.adUnitId){
            return;
        }
        // this.vedioBn.getComponent(cc.Button).interactable = false;
        lx.showRewardedVideoAd({
            adUnitId: lx.config.adUnitId,
            success: function(res){
                this.tip.getComponent(cc.Label).string="获得复活道具 X 3";
                this.tip.active=true;
                this.scheduleOnce(function(){   
                    this.tip.active=false;
                },1)
            }.bind(this),
            fail:function(err){
                this.setTooltip(lx.i18n.t("label_text.adv_2"));
            }.bind(this),
            complete:function(){
                // this.vedioBn.getComponent(cc.Button).interactable=true;          
            }.bind(this)
        });
    
    },  

    //每日礼包
    giftButton(){
        this.menu.active = false;
        this.node.getChildByName('mask2').active = true;
        var date = Math.floor((new Date()).getTime() / 86400000);
        if(date - this.playerInfo.date > 0){
            this.playerInfo.date = date;
            this.displayPrize();
        }else{
            var node = this.node.getChildByName('vedio');
            node.active = true;
            this.currPanel = node;
        }
    },
    
    shareButton(event,i){
        var query = ''
        if(!i){
            i = Math.floor(Math.random() * 10);
        }
        else if( i == 10){            
            var share = {
                type: 0,
                nickName:this.playerInfo.nickName,            
            }        
            var json = JSON.stringify(share);        
            query = 'data=' + json;
        }       
        //分享接口                
        lx.shareAppMessage({
            title: this.shareText[0].str,
            imageUrl: this.shareText[0].url,
            query: query,
            success: function(){                
                
            }.bind(this),
        });  
        this.scheduleOnce(function(){
            this.playerInfo.revive ++;
            console.log(  this.playerInfo.revive,"分享次数");
            if(this.lock){                    
                this.lock = false;
                    this.playerInfo.share ++;
                    if(this.playerInfo.share == 1)
                    this.skinQueue(3);
                    if(this.playerInfo.share == 5)
                    this.skinQueue(4);
                    if(this.playerInfo.share == 10)
                    this.skinQueue(5);
            }
        }.bind(this),2);

    },

    //立即使用皮肤
    useSkin:function(){
        this.playerInfo.tryState == 0 && (this.playerInfo.skinLocks[this.playerInfo.skin] = 1);
        this.playerInfo.tryState = 0;
        this.playerInfo.skinLocks[this.iCount] = 2;
        this.playerInfo.skin = this.iCount;
        var panel = this.node.getChildByName('getSkin');     
        panel.active = false;
        var playerInfo = JSON.stringify(this.playerInfo);
        localStorage.setItem('playerInfo5',playerInfo);
        var skinPanel = this.node.getChildByName('skinPanel');  
        var content = skinPanel.children[4].children[0];
        while(content.children.length > 0){
            content.children[0].destroy();
            content.children[0].removeFromParent();                             
        }
        this.skinButton();
    },

    selectSkin(event,i){        
        var skinPanel = this.node.getChildByName('skinPanel');      
        var content = skinPanel.children[4].children[0];
        var sprite = content.children[this.playerInfo.skin].getChildByName('button').getComponent(cc.Sprite);
        var sprite2 = content.children[i].getChildByName('button').getComponent(cc.Sprite); 
        var node = content.children[i];
        if(this.playerInfo.skinLocks[i]){
            console.log("更换装备"); 
            if(lx.language=="en"){
                this.playerInfo.tryState == 0 && (this.setSpriteFrame('button/3',sprite)); //使用
                this.setSpriteFrame('button/4',sprite2); //已装备
            }else{
                this.playerInfo.tryState == 0 && (this.setSpriteFrame('button/1',sprite));
                this.setSpriteFrame('button/2',sprite2);
            }  
            this.playerInfo.tryState == 0 && (this.playerInfo.skinLocks[this.playerInfo.skin] = 1); 
             
            for(var j = 0; j < this.playerInfo.skinLocks.length;j++){
                if(this.playerInfo.skinLocks[j] == 2 ){
                    console.log("进来变2")
                    if(lx.language=="en"){
                        (this.setSpriteFrame('button/3',content.children[j].getChildByName('button').getComponent(cc.Sprite))); //使用 
                    }else{
                        (this.setSpriteFrame('button/1',content.children[j].getChildByName('button').getComponent(cc.Sprite))); 
                    }  
                    this.playerInfo.skinLocks[j] = 1;
                }
            } 
            this.playerInfo.skinLocks[i] = 2;
            this.playerInfo.skin = i;
            this.iCount = i;  
            if(this.playerInfo.tryState == 1){
                this.tryFlag = false;
                this.usertry()
            }
            this.playerInfo.tryState = 0;
        }else{         
            switch(this.skinType[i]){
                case 0:
                if(this.playerInfo.star >= this.skinPrice[i]){
                    this.playerInfo.star -= this.skinPrice[i];
                    if(lx.language=="en"){
                        this.setSpriteFrame('button/3',sprite2);
                    }else{
                        this.setSpriteFrame('button/1',sprite2);
                    }
                    this.playerInfo.skinLocks[i] = 1;//表示皮肤拥有
                    this.iCount = i; 
                    this.getNewSkin(i); //弹出得到新皮肤弹窗 
                    node.getChildByName('label').active = false;
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
                    skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
                }
                break;
                case 1:
                if(this.playerInfo.diamond >= this.skinPrice[i]){
                    this.playerInfo.diamond -= this.skinPrice[i];
                    if(lx.language=="en"){
                        this.setSpriteFrame('button/3',sprite2);
                    }else{
                        this.setSpriteFrame('button/1',sprite2);
                    }
                    this.playerInfo.skinLocks[i] = 1;
                    this.iCount = i;
                    this.getNewSkin(i); //弹出得到新皮肤弹窗 
                    node.getChildByName('label').active = false;
                    node.getChildByName('start').active = false;
                    node.getChildByName('diamond').active = false;
                    skinPanel.getChildByName('star').children[0].getComponent(cc.Label).string = this.playerInfo.star;
                    skinPanel.getChildByName('diamond').children[0].getComponent(cc.Label).string = this.playerInfo.diamond;
                }
                break;
                case 2:
                    this.shareSkinFun(node,i,sprite2);//分享逻辑
            }
        }                
    },

    //分享皮肤逻辑
    shareSkinFun:function(node,i,sprite2){
        var shareInfo=JSON.parse(localStorage.getItem('shareInfo'));
        if(i==3){//分享1次
            this.tip.getComponent(cc.Label).string="分享"+ shareInfo.share_1 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    // node.getChildByName('label').getComponent(cc.Label).string="分享"+  shareInfo.share_2 +"次可获得该皮肤";
                    shareInfo.share_1--;               
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_1--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2);
               
                lx.shareAppMessage({
                    title: this.shareText[0].str,
                    imageUrl: this.shareText[0].url,
                    success: function(){ 
                    
                    }.bind(this),
                });  
            }.bind(this),1);
        }
        if(i==4){//分享5次
            this.tip.getComponent(cc.Label).string="分享"+  shareInfo.share_2 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    shareInfo.share_2--;      
                    node.getChildByName("")         
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_2--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2);
               
                lx.shareAppMessage({
                    title: this.shareText[1].str,
                    imageUrl: this.shareText[1].url,
                    success: function(){ 
                      
                    }.bind(this),
                });  
            }.bind(this),1);
        }
        if(i==5){//分享10次
            this.tip.getComponent(cc.Label).string="分享"+ shareInfo.share_3 +"次可获得该皮肤";
            this.tip.active=true;
            this.scheduleOnce(function(){
                this.tip.active=false;
                this.scheduleOnce(function(){
                    console.log("分享成功");
                    shareInfo.share_3--;               
                    localStorage.setItem('shareInfo',JSON.stringify(shareInfo));
                    if(shareInfo.share_3--==0){
                        if(lx.language=="en"){
                            this.setSpriteFrame('button/3',sprite2);
                        }else{
                            this.setSpriteFrame('button/1',sprite2);
                        }
                        this.playerInfo.skinLocks[i] = 1;
                        this.getNewSkin(i); //弹出得到新皮肤弹窗 
                        node.getChildByName('label').active = false;
                        node.getChildByName('start').active = false;
                        node.getChildByName('diamond').active = false;
                    }
                }.bind(this),2)
 
                lx.shareAppMessage({
                    title: this.shareText[2].str,
                    imageUrl: this.shareText[2].url,
                    success: function(){ 
                
                    }.bind(this),
                });  
            }.bind(this),1);
        }
    },

    //切换本地骨骼动画
    setSkeletonData(node,url,anim,callBack,timeScale,loop){//设置spine动画
        cc.loader.loadRes(url,sp.SkeletonData,function(err,sk){
            if(!err){
                if(node.getComponent(sp.Skeleton).skeletonData != sk){
                    //释放以前的骨骼资源
                    var deps = cc.loader.getDependsRecursively(node.getComponent(sp.Skeleton).skeletonData);
                    cc.loader.release(deps);
                    //替换骨骼资源
                    node.getComponent(sp.Skeleton).skeletonData = sk;
                }           
                if(anim){
                    node.getComponent(sp.Skeleton).animation = anim;//播放动画
                }
                node.getComponent(sp.Skeleton).loop = loop; 
                callBack && callBack();
                if(timeScale){
                    node.getComponent(sp.Skeleton).timeScale = timeScale;             
                }   
            }            
        });
    },

    getPrize(){        
        var prize = this.node.getChildByName('prize2');
        prize.active = true;
        prize.setContentSize(cc.winSize);
        prize.getChildByName('mask').setContentSize(cc.winSize);
        prize.getChildByName('diamond').children[0].getComponent(cc.Label).string = '???';
        prize.getChildByName('star').children[0].getComponent(cc.Label).string = '???';
        this.ADType = 1;
    },

    exitPrize(){
        var prize = this.node.getChildByName('prize2');
        prize.active = false;
    },

    navigate(event,id){        
        wx.navigateToMiniProgram({
            appId:'wx9e2044ead46f516e',
            path:'pages/index/index?source=8016&ald_media_id=6252&ald_link_key=c4174dd7e6f74ac5',
        });                
    },

    navigate2(){
        wx.navigateToMiniProgram({
            appId:"wx9e2044ead46f516e",
            path:"pages/index/index?source=8004", 
        });
    },
    
    loadText(){
        this.skinPrice = [0,lx.i18n.t("label_text.skinText1"),lx.i18n.t("label_text.skinText2"),
        lx.i18n.t("label_text.skinText4"),lx.i18n.t("label_text.skinText5"),800,800,1800,1800,3800,3800,3800,9900,9900,680,680,1880,1880];//价格类型
        this.skinType = [2,2,2,2,2,0,0,0,0,0,0,0,0,0,1,1,1,1];//2(分享)1(钻石)0(星星)
        this.shareText = [            
              
            {
                str:lx.i18n.t("label_text.shareText16"),
                url:'https://h5.lexun.com/games/wx/avatar/g17.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText17"),
                url:'https://h5.lexun.com/games/wx/avatar/g18.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText18"),
                url:'https://h5.lexun.com/games/wx/avatar/g19.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText19"),
                url:'https://h5.lexun.com/games/wx/avatar/g20.jpg',
            },
            {
                str:lx.i18n.t("label_text.shareText20"),
                url:'https://h5.lexun.com/games/wx/avatar/g21.jpg',
            }, 
        ];
    },
    usertry:function(){
        var content = this.currPanel.children[4].children[0];
        if(this.tryFlag){
            this.tryFlag = false; 
            this.tryButton.spriteFrame = this.trySprite[1];
            
            this.playerInfo.tryState = 1; //试穿状态
            for(var i=0; i < this.playerInfo.tryskin.length;i++){
                if(this.playerInfo.skinLocks[i] == 0){
                    content.children[i].getChildByName("try").active = true;
                    if(this.playerInfo.tryskin[i] == 0){
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[0];
                        var clickEventHandler = new cc.Component.EventHandler();
                        clickEventHandler.target = this.node;
                        clickEventHandler.component = "game";
                        clickEventHandler.handler = 'tryShare';
                        clickEventHandler.customEventData = i;
                        var button = content.children[i].getChildByName('try').getComponent(cc.Button);
                        button.clickEvents.push(clickEventHandler);
                    }else if(this.playerInfo.tryskin[i] == 2){
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[2];
                    }else{
                        content.children[i].getChildByName("try").getComponent(cc.Sprite).spriteFrame = this.trybuttonSprite[1];
                    }
                }
            }
        }else{
            this.tryFlag = true; 
            this.tryButton.spriteFrame = this.trySprite[0];
            for(var i=0; i < this.playerInfo.tryskin.length;i++){
                content.children[i].getChildByName("try").active = false;
            } 
        }
    },
    tryShare:function(event,pos){
        var i = Math.floor(Math.random() * this.shareText.length);
        var content = this.currPanel.children[4].children[0];
        var self = this; 
        //弹框
        this.tip.getComponent(cc.Label).string="分享后可获得该皮肤";
        this.tip.active=true;
        //弹出提示再分享
        this.scheduleOnce(function(){
            this.tip.active=false;
            //皮肤展示框
            this.scheduleOnce(function(){
                self.getTrySkin(pos);
                if(self.playerInfo.skinLocks[self.playerInfo.skin] != 0){
                    var sprite = content.children[self.playerInfo.skin].getChildByName('button').getComponent(cc.Sprite); 
                    console.log("更换了使用")
                    if(lx.language=="en"){
                        self.setSpriteFrame('button/3',sprite);
                    }else{
                        self.setSpriteFrame('button/1',sprite);
                    }
               }
                if(self.playerInfo.tryskin[self.playerInfo.skin] !=2){
                    content.children[self.playerInfo.skin].getChildByName("try").getComponent(cc.Sprite).spriteFrame = self.trybuttonSprite[0]; 
                }
                content.children[pos].getChildByName("try").getComponent(cc.Sprite).spriteFrame = self.trybuttonSprite[1];
                console.log("试穿成功",pos);
                if(self.playerInfo.skinLocks[self.playerInfo.skin] == 2){
                    self.playerInfo.skinLocks[self.playerInfo.skin] = 1;
                    console.log("改变成1")
                }else{
                    self.playerInfo.skinLocks[self.playerInfo.skin] = 0;
                    console.log("改变成0")
                }
                self.playerInfo.skin = pos;
                self.playerInfo.tryState = 1;
            },2);
        
            lx.shareAppMessage({
                title: self.shareText[i].str,
                imageUrl: self.shareText[i].url,
                success: function(res){
                    
                }
            })
        }.bind(this),1);
    },
    shareApp:function(){
        var i = Math.floor(Math.random() * this.shareText.length);
        var self = this;
        this.scheduleOnce(function(){
            self.getskinPopup.active = false; 
        },2);

        lx.shareAppMessage({
            title: self.shareText[i].str,
            imageUrl: self.shareText[i].url,
            success: function(res){
            }
        });
    },
    jumpOut:function(){
        var panel = this.node.getChildByName('getSkin');       
        panel.active = false;
    },
    jumpTryOut:function(){
        var panel = this.node.getChildByName('getTrySkin');       
        panel.active = false;
    },

    //buff增益
    onBuffEffect:function(event,clicktype){
        var i = Math.floor(Math.random() * this.shareText.length);
        //调用分享
        this.scheduleOnce(function(){
            console.log("buff增益分享成功")
            cc.find("Canvas/buff").getChildByName("star").active=false;
            //星星buff
            this.buffTip.getComponent(cc.Label).string="分享成功,获得星星buff";
            this.buffTip.active=true;
            localStorage.setItem('starBuff',true);
            this.scheduleOnce(function(){
                this.buffTip.active=false;
            }.bind(this),2);
        }.bind(this),2)

        lx.shareAppMessage({
            title: this.shareText[i].str,
            imageUrl: this.shareText[i].url,
            success: function(res){
              
            }.bind(this)
        })    
    },

    //banner广告
    creatrBanner:function(){
        var object={
            adUnitId:"adunit-e4255b8476385b41",
            style:{
                left: 0, //wx.getSystemInfoSync().windowWidth wx.getSystemInfoSync().windowHeight
                top: 0,
                width: wx.getSystemInfoSync().screenWidth,
            }
        }
        var bannerAd=lx.createBannerAd(object);
            bannerAd.onError(err => {
            console.log(err)
        })
            bannerAd.onResize(res => {
            bannerAd.style.top = wx.getSystemInfoSync().windowHeight -bannerAd.style.realHeight;
        })
        this.bannerAd=bannerAd;
        this.bannerAd.show();   
    },


    update (dt) {
        if(this.onclick==true){
            if(this.scene_tag==true){
                this.scene_tag=false;
                cc.director.loadScene("main");
            }
        }
    },
});

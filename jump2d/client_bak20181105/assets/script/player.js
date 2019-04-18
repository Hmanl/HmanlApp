var seedRandom = require("seedRandom");
cc.Class({
    extends: cc.Component,

    properties: {                
        blockList:[cc.Prefab],        
        audios:[cc.AudioClip],        
        canvas:cc.Node,
    }, 

    start(){
        var json = localStorage.getItem('userInfo2'); 
        if(json){
            this.userInfo = JSON.parse(json);
        }else{
            this.userInfo = {
                spring:20,
                revive:0,
                gem:0,
                skin:0,
                date:111,
                gender:1,
                avatar:'',
                nickName:'我',
                beginner:0,
                skinLocks:[true,false,false,false,false,false,false,false,false],                
            }; 
        }             
        
        this.stage = this.canvas.getChildByName('stage');
        this.shadow = this.stage.getChildByName('shadow');
        this.blockLayer = this.stage.getChildByName('blockLayer');
        this.UI = this.canvas.getChildByName('UI');
        this.revive = this.canvas.getChildByName('revive');        
        this.overPanel = this.canvas.getChildByName('overPanel');
        this.pointGroup = this.stage.getChildByName('pointGroup');
        this.loadText();
        this.loadRobotInfo();                      
        this.actName = this.male;
        this.bodyAnim = this.male2;
        this.bodyAnim2 = this.female2;        
        this.amount = 0;                
        this.power = 0;
        this.dir = 1;
        this.score = 0;
        this.privityValue = 0;
        this.batter = 0;
        this.batter2 = 0;
        this.batter3 = 0;
        this.center = cc.p(43,57);
        this.origin = cc.p(-250,-80);
        this.ready = true;
        this.locList = new Array();
        this.currClip = 0;
        this.continue = 0;
        this.loop = true;
        this.dur = 5;        
        this.rag = 0;
        
        this.range = 0;
        this.shadowState = true;
        this.lock = false;
        this.canvas.getChildByName('mask').setContentSize(cc.winSize);
        this.canvas.getChildByName('mask2').setContentSize(cc.winSize);         
        this.reset();                 
    },

    touchStart(event){
        this.play(1);               
    },

    touchEnd(event){
        if(this.ready){
            this.play(3);                    
        }      
    },

    update(dt){        
        this.onContinue(dt);
    },

    play:function(i){
        if(i > this.currClip){
            var spine = this.node.children[1].getComponent(sp.Skeleton);            
            this.actName[i]?spine.animation = this.actName[i]:spine.animation = this.actName[0];
            this.currClip = i;
            this.getAnimDuration(i);
            this.onPlay();                        
        }      
    },

    forcedPlay:function(i){        
        var spine = this.node.children[1].getComponent(sp.Skeleton);
        spine.animation = this.actName[i];
        this.currClip = i;
        this.getAnimDuration(i);
        this.onPlay();        
    },

    playAddAnim:function(i,bool){
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.loop = bool;
        this.actName2[i]?spine.animation = this.actName2[i]:spine.animation = null;                              
    },

    playShadowAnim:function(i){
        var spine = this.node.children[2].getComponent(sp.Skeleton);
        spine.animation = this.actName3[i];        
        var spine2 = this.canvas.getChildByName('excellent').getComponent(sp.Skeleton);
        spine2.animation = this.actName4[i];
    },

    getAnimDuration:function(i){
        switch(i){
            case 0:
            this.dur = 5;
            break;
            case 1:
            this.dur = 2;
            break;
            case 2:
            this.dur = 20;
            break;
            case 3:
            this.dur = 0.45;
            break;            
            default:
            this.dur = 1; 
        }
    },

    reset:function(){        
        var springButton = this.UI.getChildByName('springButton');             
        springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();
        
        if(typeof(sharedCanvas) == 'undefined'){            
            this.hp = 0;
        }else{            
            this.createAD();
            this.hp = 1;
        }        
        this.getQuery();
        let blockNode = cc.instantiate(this.blockList[0]);        
        let block = blockNode.getComponent("block");
        blockNode.position = this.origin;
        blockNode.parent = this.blockLayer;
        this.currBlock = block;               
        this.node.position = cc.pAdd(blockNode.position,this.center);
        this.shadow.setPosition(this.node.position);
        this.addBlock();
        cc.audioEngine.playMusic(this.audios[4], true); 
        this.setChat('点击好友的分享链接可以和好友一起玩哦~');                    
    },

    getQuery(){        
        var shadowInfo = this.UI.getChildByName('shadowInfo');   
        var sprite = shadowInfo.children[0].children[0].getComponent(cc.Sprite);
        var label = shadowInfo.children[1].getComponent(cc.Label);
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        if(this.userInfo.gender == 2){
            this.actName = this.female;
            this.forcedPlay(0);
            this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";           
            this.bodyAnim = this.female2;
            this.bodyAnim2 = this.male2;                                            
        }
        if(typeof(sharedCanvas) == 'undefined'){
            this.seed = (new Date()).getTime();            
            this.rnd = new seedRandom(this.seed);
            this.fAmount = Math.floor(Math.random()*400);            
            var index = localStorage.getItem('robot');
            var robotInfo = this.robots[this.userInfo.gender-1][index];
            cc.loader.loadRes(robotInfo.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            });
            label.string = robotInfo.nickName;
            label2.string = robotInfo.nickName;
            var url = {type:0,value:index};
            this.fUrl = JSON.stringify(url);
        }else{
            var launchOption = wx.getLaunchOptionsSync();        
            if(launchOption.query.data){            
                this.launch = JSON.parse(launchOption.query.data);
                this.seed = this.launch.seed;
                this.rnd = new seedRandom(this.launch.seed);
                if(this.launch.gender == 1){
                    this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";
                    this.bodyAnim2 = this.male2;
                }else{
                    this.shadow.children[0].getComponent(sp.Skeleton).animation = "G_body_stand";
                    this.bodyAnim2 = this.female2; 
                }                                        
                this.createImage(sprite,this.launch.avatar);
                var url = {type:1,value:this.launch.avatar};            
                label.string = this.launch.nickName;
                label2.string = this.launch.nickName;
                this.fAmount = this.launch.list.length;                        
            }else{
                this.seed = (new Date()).getTime();            
                this.rnd = new seedRandom(this.seed);
                this.fAmount = Math.floor(Math.random()*400);            
                var index = localStorage.getItem('robot');
                var robotInfo = this.robots[this.userInfo.gender-1][index];
                cc.loader.loadRes(robotInfo.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                    sprite.spriteFrame = spriteFrame;
                });
                label.string = robotInfo.nickName;
                label2.string = robotInfo.nickName;
                var url = {type:0,value:index};
            }
            this.fUrl = JSON.stringify(url);
        }        
    },

    addBlock:function(){
        let n = Math.floor(this.rnd.rand() * this.blockList.length);
        let blockNode = cc.instantiate(this.blockList[n]);        
        let block = blockNode.getComponent("block");
        let distance = 0;
        this.amount <= 100?distance = 200 + this.rnd.rand()  *(200+this.amount):distance = 200 + this.rnd.rand()  *300;            
        var direction = new cc.Vec2(Math.cos(0.556047197640118),Math.sin(0.556047197640118));
        var vec = direction.mul(distance);
        vec.x *= this.dir;               
        var pos = cc.pAdd(this.currBlock.node.position,vec);
        blockNode.position = pos;
        blockNode.parent = this.blockLayer;       
        this.nextBlock = block;        
        this.amount++;        
        if(this.amount == 1)
            this.canvas.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'logo_start';
        if(this.amount == 2)
            this.canvas.getChildByName('finger').getComponent(sp.Skeleton).animation = null;       
        if(this.amount == 6){
            this.lock = true;
            this.canvas.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
            this.canvas.on(cc.Node.EventType.TOUCH_END,this.touchEnd, this);            
            this.canvas.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_loop';
            this.canvas.getChildByName('finger').getComponent(sp.Skeleton).loop = true;
            this.canvas.getChildByName('finger').getComponent(sp.Skeleton).animation = 'mouse_click';
        }
        if(this.amount == 7){            
            this.canvas.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_end';
            this.canvas.getChildByName('finger').destroy();
        }
        if(this.amount == 8)
            this.canvas.getChildByName('followMe').destroy();
        if(this.amount == 15){
            this.lock = false;
            this.UI.getChildByName('aimButton').active = true;
        }           
        blockNode.zIndex = -1 + this.amount * -1;
        this.node.setScale(this.dir,1);        
        this.shadowJump(distance,direction,block);      
    },    

    onPlay:function(){                                 
        switch(this.currClip){
            case 1:
            this.onPlayReady();            
            break;
            case 3:
            this.onPlayJump();
            break;                        
        }
        this.continue = 0;              
        this.loop = true;
    },

    onContinue:function(dt){        
        if(this.loop){
            this.continue += dt;                                        
            if(this.continue < this.dur){                                                       
                switch(this.currClip){
                    case 1:            
                    this.onContinueReady(dt);                    
                    break;
                    case 2:
                    this.onContinueMax(dt);
                    break;                            
                }
            }else{
                this.loop = false;                              
                this.onFinished();                                
            }
        }      
    },

    onFinished:function(){                        
        switch(this.currClip){
            case 0:
            this.onFinishedIdel();
            break;
            case 1:            
            this.onFinishedReady();            
            break;
            case 3:
            this.onFinishedJump();
            break;                                                      
        }
    },

    onPlayReady:function(){                          
        this.currBlock.ready();
        this.playAddAnim(0,true);
        this.ready = true;
        this.audioID = cc.audioEngine.playEffect(this.audios[5], false);                               
    },

    onPlayJump:function(){        
        this.ready = false;
        cc.audioEngine.stopEffect(this.audioID);        
        this.currBlock.jump();
        this.playAddAnim(null,false);
        this.playShadowAnim(null);
        var direction=new cc.Vec2(Math.cos(0.556047197640118),Math.sin(0.556047197640118));
        var vec = direction.mul(this.jumpDistance);        
        vec.x *= this.dir;
        var originPos = cc.pAdd(this.currBlock.node.position,this.center);
        this.targetPos = cc.pAdd(originPos,vec);
        let jumpAction = cc.jumpTo(0.4,this.targetPos,200,1);
        let rotateAction = cc.rotateBy(0.4,this.dir*360);
        var spawn = cc.spawn(jumpAction,rotateAction);        
        this.node.runAction(spawn);
        this.power = 0;                   
    },     
    
    onContinueReady:function(dt){        
        this.power += dt;            
        this.jumpDistance = this.power * 500;        
        this.node.y -= dt*17.5;
        if(this.lock){
            this.pointGroup.active = true;
            var direction=new cc.Vec2(Math.cos(0.556047197640118),Math.sin(0.556047197640118));
            var vec = direction.mul(this.jumpDistance);
            vec.x *= this.dir;
            var originPos = cc.pAdd(this.currBlock.node.position,this.center);
            originPos.subSelf(cc.v2(0,63));
            for(var i = 0; i < 10; i ++){
                var k = 0.1 * (i + 1);
                var p1 = this.bezier(cc.v2(vec.x * 0.25,350),vec,k);
                var tPos = cc.pAdd(originPos,p1);
                this.pointGroup.children[i].setPosition(tPos);
            }  
        }          
    },

    bezier(v1,v2,t){
        var p0 = cc.pMult(cc.v2(0,0),Math.pow(1 - t,2));
        var p1 = cc.pMult(v1,2 * t * (1 - t));
        var p2 = cc.pMult(v2,Math.pow(t,2));
        var p = cc.pAdd(p0,p1);
        p = cc.pAdd(p,p2);
        return p;       
    },

    onContinueMax:function(dt){        
        this.power += dt;            
        this.jumpDistance = this.power * 500;        
    },

    onFinishedIdel(){       
        var i = Math.floor(Math.random()*this.content.length);
        this.setChat(this.content[i]);        
    },

    onFinishedReady:function(){       
        this.play(2);
    },

    onFinishedJump:function(){
        this.pointGroup.active = false;        
        var result = this.nextBlock.jumpResult(this.targetPos);
        var result2 = this.currBlock.jumpResult(this.targetPos);
        if(result){
            this.forcedPlay(0);
            if(this.locList.length < 400)
                this.locList.push(Math.floor(this.jumpDistance));
            var per = this.nextBlock.jumpPerfect(this.targetPos);            
            if(per){
                this.batter++;                
                var score = this.batter*2;
                this.batter > 3 ? this.playAddAnim(3,false):this.playAddAnim(this.batter,false);
                cc.audioEngine.playEffect(this.audios[2],false);                                
            }else{                
                this.batter = 0;
                var score = 1;
                cc.audioEngine.playEffect(this.audios[1],false);              
            }            
            this.checkShadow(this.targetPos);
            score += this.batter3*3;            
            this.setScore(score);
            this.changeDir();
            this.updateView();            
            this.currBlock = this.nextBlock;
            this.addBlock();
        }
        else{                        
            if(result2){
                this.forcedPlay(0);
                this.batter = 0;                
            }else{                               
                this.node.parent = this.blockLayer;
                var vec = cc.pAdd(this.nextBlock.node.position,this.center);
                var index = this.nextBlock.node.zIndex;
                var d = (vec.x - this.node.x)/Math.abs(vec.x - this.node.x);
                this.node.zIndex = index + 0.5*d*this.dir;
                var finished = cc.callFunc(function(){this.hp >= 1?this.diamondRevive():this.gameOver();}, this);      
                let action = cc.sequence(cc.moveBy(0.5,cc.p(0,-85)),finished);
                this.node.runAction(action);                
            }
        }             
    },

    setScore:function(num){
        var score = this.UI.getChildByName('score');
        score.getChildByName('add1').getComponent(cc.Label).string = this.score.toString();
        score.getChildByName('add2').getComponent(cc.Label).string = num.toString();
        this.score += num;
        score.getChildByName('sum').getComponent(cc.Label).string = this.score.toString();
        score.getComponent(cc.Animation).play();
        this.createCountBoard(this.node.position,num);        
        var range = Math.floor(this.score/50);
        if(range<this.content2.length && range>0 && range!=this.rag){
            this.rag = range;
            this.setChat(this.content2[range-1]);
        }            
    },

    createCountBoard:function(pos,count){                
        var countBoard = this.stage.getChildByName('countBoard');
        countBoard.active = true;        
        countBoard.getComponent(cc.Label).string = count;
        countBoard.setPosition(pos);        
        var finished = cc.callFunc(function() {
            countBoard.active = false;
        }, this);
        var action = cc.sequence(cc.moveBy(0.5,0,100), cc.moveBy(0.3,0,20),finished);        
        countBoard.runAction(action);
    },

    updateView:function(){        
        let moveVector = cc.pSub(this.currBlock.node.position,this.nextBlock.node.position);
        if(this.batter2 == 0){            
            moveVector.x += 400*this.dir*-1;            
        }
        let action = cc.moveBy(0.5,moveVector);
        this.stage.runAction(action);
        var bg = this.canvas.getChildByName('bg');
        var vec2 = bg.position.clone();        
        bg.setPosition(vec2.x%960,vec2.y%1668);        
        bg.runAction(action.clone());        
        this.optimize();
    },

    changeDir:function(){
        var newDir = this.rnd.rand() >0.5?1:-1;
        if(newDir == this.dir){
            this.batter2 ++;
        }else{
            this.dir = newDir;
            this.batter2 = 0;
        }
    },

    optimize:function(){
        for(var i = 0; i<this.blockLayer.children.length;i++){
            var dis = cc.pDistance(this.blockLayer.children[i].position,this.node.position);
            if(dis>1000){
                this.blockLayer.children[i].destroy();
            }
        }
    },
    
    setChat(str){
        var chat = this.UI.getChildByName('chat');
        if(!chat.activeInHierarchy){
            chat.active = true;                
            chat.children[0].getComponent(cc.Label).string = str;
            var callBack = function(){chat.active = false;};
            this.scheduleOnce(callBack,3);
        }        
    },

    checkShadow:function(pos){        
        var dis = cc.pDistance(this.shadow.position,pos);
        var spine3 = this.canvas.getChildByName('screenEffect').getComponent(sp.Skeleton);
        if(dis < 30){
            cc.audioEngine.playEffect(this.audios[3],false);
            this.privityValue ++;
            if(this.privityValue <= 100)
                this.UI.getChildByName("heart").children[0].children[0].y ++;
            var label = this.UI.getChildByName("privityValue").getComponent(cc.Label);
            label.string = this.privityValue;                                   
            this.batter3++;
            if(this.batter3 == 6)
            this.changeColorOfScore(cc.Color.ORANGE);            
            if(this.batter3 == 12){
                this.changeColorOfScore(cc.Color.MAGENTA);
                this.UI.getChildByName('effect').active = true;
            }           
            var hit = this.canvas.getChildByName('hit');
            hit.getComponent(cc.Label).string = this.batter3 + '连击';
            var action2 = cc.sequence(cc.fadeIn(0.2),cc.delayTime(0.5),cc.fadeOut(0.3));
            hit.runAction(action2);
            //this.batter3 > 5?this.playShadowAnim(4):this.playShadowAnim(this.batter3-1);
            var range = Math.floor(this.batter3/3);
            range > 4 ? this.playShadowAnim(4):this.playShadowAnim(range); 
            if(range > 0 && this.range != range && range < 6){                
                var mask = this.canvas.getChildByName('mask2');                
                if(mask.opacity == 0){
                    mask.opacity = 153;                    
                }                                    
                this.range = range;                
                spine3.animation = this.actName5[range-1];
            }                                               
        }else{
            this.batter3 = 0;
            var effect = this.UI.getChildByName('effect');
            if(effect){
                effect.active = false;
                this.changeColorOfScore(cc.Color.WHITE);
            }            
            var mask = this.canvas.getChildByName('mask2');
            if(mask.opacity > 0){
                mask.opacity = 0;
                this.range = 0;                           
            }                       
            spine3.animation = null;
        }
    },

    changeColorOfScore(col){
        var score = this.UI.getChildByName('score');
        score.getChildByName('add2').children[0].color = col;
        for(var i = 0; i < score.children.length; i++){
            score.children[i].color = col;
        }
    },

    shadowJump(distance,direction,block){
        this.shadowState = false;
        if(this.launch&&this.launch.list[this.amount-1]){
            var pDis = this.launch.list[this.amount-1];
        }else{
            var pDis = distance + (Math.random()*2-1)*(block.radius-20);
        }
        var pVec = direction.mul(pDis);
        pVec.x *= this.dir;
        var originPos = cc.pAdd(this.currBlock.node.position,this.center);
        var targetPos = cc.pAdd(originPos,pVec);
        let jumpAction = cc.jumpTo(0.4,targetPos,200,1);
        let rotateAction = cc.rotateBy(0.4,this.dir*360);
        var spawn = cc.spawn(jumpAction,rotateAction);
        var delay = cc.delayTime(0.3);
        var finished = cc.callFunc(function(){
            this.shadowState = true;
            if(this.amount < 6){
                if(this.amount == 1){
                    this.play(1);
                    this.canvas.getChildByName('finger').getComponent(sp.Skeleton).animation = 'mouse_click3';
                    this.scheduleOnce(function(){                        
                        var originPos = cc.pAdd(this.currBlock.node.position,this.center);
                        this.jumpDistance = cc.pDistance(originPos,this.shadow.position);
                        this.play(3);
                    },0.7);
                }else{
                    var originPos = cc.pAdd(this.currBlock.node.position,this.center);
                    this.jumpDistance = cc.pDistance(originPos,this.shadow.position);
                    this.play(3); 
                }                                                       
            }            
        },this);
        var sequence = cc.sequence(delay,spawn,finished);        
        this.shadow.runAction(sequence);
        this.shadow.setScale(this.dir,1);          
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

    diamondRevive(){
        this.revive.active = true;
        this.canvas.getChildByName('mask').active = true;
        this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
    },
    
    giveUp(){
        var effect = this.stage.getChildByName('effect');              
        effect.position = this.shadow.position;
        this.canvas.getChildByName('mask').active = false;
        effect.getComponent(sp.Skeleton).animation = 'break_love';
        this.scheduleOnce(this.gameOver,1);
        this.revive.active = false;        
    },    

    onClickShareButton:function(){        
        var share = {
            list:this.locList,
            seed:this.seed,
            avatar:this.userInfo.avatar,
            nickName:this.userInfo.nickName,
            gender:this.userInfo.gender,
        }
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        var json = JSON.stringify(share);        
        var query = 'data=' + json;
        var range = Math.floor(this.score/200);
        if(range>4)
            range = 4;        
        var str = '我的天呐，我和'+label2.string+'的缘分竟然是'+this.content3[range]+'!';
        var imageUrl = null;
        this.score > 200?imageUrl = this.imageUrl[1]:imageUrl = this.imageUrl[0];                                                     
        wx.shareAppMessage({
            title: str,
            imageUrl:imageUrl,
            query: query,
            success:function(){                
                this.userInfo.spring += 5;
                if(this.userInfo.spring > 10)
                this.userInfo.spring = 10;
            }.bind(this),            
        });   
    },

    checkRevive(){        
        if(this.userInfo.revive > 0){
            this.userInfo.revive --;           
            this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
            this.reviving();
        }else{
            this.setTooltip('没有天使复活了哦，快去点击视频复活吧~');
        }      
    },

    reviving(){
        this.hp--;        
        this.revive.active = false;
        this.canvas.getChildByName('mask').active = false;
        var center = cc.pAdd(this.currBlock.node.position,this.center);
        var effect = this.stage.getChildByName('effect');
        effect.setPosition(center);
        effect.getComponent(sp.Skeleton).animation = 'revive';
        var callBack = function(){this.forcedPlay(0);};           
        this.scheduleOnce(callBack,1.5);
        this.batter = 0;
        this.node.zIndex = 1;
        this.node.setPosition(center);
        this.node.parent = this.stage;
    },

    setTooltip(str){        
        var node = this.canvas.getChildByName('label');
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

    displayAD(){
        this.vedio ? this.vedio.show():this.setTooltip('版本过低无法观看广告');        
    },

    createAD(){
        var systemInfo = wx.getSystemInfoSync();
        var num = parseInt(systemInfo.SDKVersion.replace(/\./g,''));
        if(num >= 210){
            this.vedio = wx.createRewardedVideoAd({adUnitId:'adunit-f2b4d92431c80b1e'});
            this.vedio.onClose(function(res){
                res.isEnded ? this.reviving():this.setTooltip('没有观看完整广告,不能复活');                               
            }.bind(this));
        }
    },

    checkBackButton(){
        this.overPanel.active = true;
        this.canvas.getChildByName('subCanvas').active = false;
        this.canvas.getChildByName('back').active = false;
    },

    onClickRank(){
        this.overPanel.active = false;
        this.canvas.getChildByName('subCanvas').active = true;
        this.canvas.getChildByName('back').active = true;
    },

    onClickPerfectButton(){
        if(this.shadowState&&this.userInfo.spring>0&&this.currClip == 0){
            var originPos = cc.pAdd(this.currBlock.node.position,this.center);
            this.jumpDistance = cc.pDistance(originPos,this.shadow.position);
            this.play(3);            
            this.userInfo.spring --; 
            var springButton = this.UI.getChildByName('springButton'); 
            springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();
        }
        if(this.userInfo.spring == 0){            
            this.setTooltip('弹簧道具可在首页丘比特免费获得~');           
        }
    },

    onClickAimButton(){
        if(this.currClip == 0){
            this.canvas.getChildByName('mask').active = true;
            this.canvas.getChildByName('aimShare').active = true;
        }                
    },   

    onClickAimShareButton(){
        if(typeof(sharedCanvas) == 'undefined'){
            this.lock = true;
            this.canvas.getChildByName('aimShare').destroy();
            this.UI.getChildByName('aimButton').destroy();
            this.canvas.getChildByName('mask').active = false;
        }else{
            var i = Math.floor(Math.random()*this.shareText.length);
            wx.shareAppMessage({
                title: this.shareText[i].str,
                imageUrl:this.shareText[i].url,
                success:function(){                    
                    this.lock = true;
                    this.canvas.getChildByName('aimShare').destroy();
                    this.UI.getChildByName('aimButton').destroy();
                    this.canvas.getChildByName('mask').active = false;
                }.bind(this),                           
            });
        }        
    },

    onClickAimExitButton(){
        this.canvas.getChildByName('mask').active = false;
        this.canvas.getChildByName('aimShare').active = false;
    },

    onChangeScenes(event,scenes){
        console.log(scenes);
        if(this.vedio)
        this.vedio.offClose();        
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo2',userInfo);
        scenes == 'exit' ? wx.exitMiniProgram() : cc.director.loadScene(scenes);
    },

    gameOver:function(){        
        cc.audioEngine.playMusic(this.audios[0],false);        
        this.UI.active = false;
        this.overPanel.active = true;
        this.canvas.getChildByName('mask').active = true;                
        this.overPanel.getChildByName('heart').children[0].getComponent(cc.Label).string = this.privityValue.toString();        
        this.overPanel.getChildByName('score').children[0].getComponent(cc.Label).string = this.score.toString();
        this.overPanel.getChildByName('name').children[0].getComponent(cc.Label).string = this.userInfo.nickName; 
        var effect = this.overPanel.getChildByName('effect').getComponent(sp.Skeleton);
        var body = this.overPanel.getChildByName('body').getComponent(sp.Skeleton);        
        var body2 = this.overPanel.getChildByName('body2').getComponent(sp.Skeleton);
        body.animation = this.bodyAnim[0];
        body2.animation = this.bodyAnim2[0];                        
        var addScore = this.privityValue * 10;        
        var score = this.score;
        this.score += addScore;
        this.schedule(function(){            
            score += 10;
            this.overPanel.getChildByName('score').children[0].getComponent(cc.Label).string = score.toString();
        },0.02,this.privityValue,1.7);        
        this.scheduleOnce(function(){
            var range = Math.floor(this.score/200);
            range < 4 ? this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps[range]:
            this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps[4];                             
            this.scheduleOnce(function(){
                if(this.score>200){
                    cc.audioEngine.playEffect(this.audios[6], false);
                    body.animation = this.bodyAnim[4];
                    body2.animation = this.bodyAnim2[4];
                    effect.animation = 'win_ef';
                    this.scheduleOnce(function(){                    
                        body.animation = this.bodyAnim[2];
                        body2.animation = this.bodyAnim2[2];
                    },0.35);
                }else{
                    body.animation = this.bodyAnim[1];
                    body2.animation = this.bodyAnim2[1];                
                    this.scheduleOnce(function(){
                        effect.animation = 'lose_ef';
                    },1);            
                    this.scheduleOnce(function(){                    
                        body.animation = this.bodyAnim[3];
                        body2.animation = this.bodyAnim2[3];                         
                    },1.48);
                }
            },0.4);
        },1.7 + this.privityValue * 0.02);  
        if(typeof(sharedCanvas) == 'undefined'){
            this.overPanel.getChildByName('privityButton').active = false;
            this.overPanel.getChildByName('bunny').active = false;
            this.overPanel.getChildByName('exit').active = false;
            var key = lx.config.platform == "fbinstant" ? 'user_score' : "userScore";
            lx.getUserCloudStorage({
                key: key,
                success:function(data){
                    var preScore = data.value && data.value.game.score || 0;
                    if(preScore < this.score){
                        lx.setUserCloudStorage({
                            kvdata:{
                                key: key, 
                                value: {
                                    game: {
                                        score: this.score,
                                        update_time: new Date().getTime()
                                    }
                                }
                            },                
                        });
                    }
                }.bind(this),
            });
        }else{
            wx.postMessage({
                message:this.score.toString(),
                url:this.fUrl,
            });
        }
                
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

    loadText(){
        this.content = ['快一点嘛！我等到花儿都谢了',
        '来追我呀，如果你追到我，我就让你嘿嘿嘿!'];
        this.content2 = ['跳到200分，我就和你谈恋爱!',
            '想知道，喜欢一个人，是什么样的感觉？',
            '再弹50步，我们之间的缘分就是情窦初开哟~',
            '好像，心跳的更快了~',
            '喜欢你，像风吹过几万里',
            '跳到400分，这辈子我就是你的人了！',
            '你，是我心中的英雄！',
            '是你，让我魂牵梦萦~',
            '问世间转过多少流年，才会有一次擦肩',
            '天地多辽远，而你就在我眼前',
            '山无棱，天地合，乃敢与君绝',
            '我们的情谊比金坚，你知道吗？',
            '跳到800分，我就让你嘿嘿嘿...',
            '有人说，我们是天作之合的眷侣~',
            '曾经她就在我的面前，我却说不出口：我爱你',
            '主人，放下手中的游戏，勇敢地与那个她（他）表白吧'];
        this.content3 = ['恋人未满','情窦初开','魂萦梦绕','情比金坚','天作之合'];
        this.imageUrl = ['https://h5.lexun.com/games/wx/avatar/share0.png',
                        'https://h5.lexun.com/games/wx/avatar/share1.png',];
        this.stamps = ['grade_5','grade_4','grade_3','grade_2','grade_1'];
        this.actName5 = ['combo_01','combo_02','combo_03','combo_04','combo_05'];
        this.actName4 = ['good','cool','great','perfect','excellent'];
        this.actName3 = ['body_combo01','body_combo02','body_combo03','body_combo04','body_combo05'];
        this.actName2 = ['xuli','ring_01','ring_02','ring_03'];
        this.male2 = ['boy_stand','boy_lose','boy_win','boy_lose_loop','boy_win_start'];
        this.female2 = ['girl_stand','girl_lose','girl_win','girl_lose_loop','girl_win_start',];
        this.male = ['body_stand','body_press','body_down'];
        this.female = ['G_body_stand','G_body_press','G_body_down'];
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

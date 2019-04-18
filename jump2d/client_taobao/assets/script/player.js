var seedRandom = require("seedRandom");
var Ag = window.Ag && window.Ag.default;
var game = require('gameData');
if (Ag)
    var ag = new Ag({bizType:2});
cc.Class({
    extends: cc.Component,

    properties: {                
        blockList:[cc.Prefab],        
        audios:[cc.AudioClip],                      
        tex2D:cc.SpriteFrame,
        noviceTex:cc.SpriteFrame,
        canvas:cc.Node,
    },

    onLoad(){
        this.stage = this.canvas.getChildByName('stage');
        this.shadow = this.stage.getChildByName('shadow');
        this.blockLayer = this.stage.getChildByName('blockLayer');
        this.UI = this.canvas.getChildByName('UI');
        this.revive = this.canvas.getChildByName('revive');        
        this.overPanel = this.canvas.getChildByName('overPanel');             
        this.canvas.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
        this.canvas.on(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
        this.loadText();
        this.loadRobotInfo();
        this.initialization();
        
    // cc.director.preloadScene("start");
        //默认开启背景音乐
        ag.getInitConfig().then((config) => {
            config.audioStatus = true;
        });
        // ag.on(ag.constant.EVENT_AUDIO_STATUS_CHANGE, ({audioStatus = true}) => {
        // });
        //联运游戏
            ag.reportProgress({
                ready: false,
                progressList: [{
                openId: '',
                progress: 0,
                status: 'initializing',
                }],
            });
            cc.log('waitForBattle');
            ag.waitForBattle().then((battleInfo) => {             
                game.openId = battleInfo.openId;
                game.battleId = battleInfo.battleId;
                game.groupId = battleInfo.extra.userInfo.groupId;
            });
            ag.reportProgress({
                ready: true,
                progressList: [{
                openId: game.openId,
                progress: 100,
                status: 'completed', 
                }],
            });
            ag.emit(ag.constant.EVENT_LOAD_RES_PROGRESS_CHANGED,{ready:true, process:100});
    },

    touchStart(event){
        this.play(1);        
    },

    touchEnd(event){
        if(this.ready){
            this.play(3);            
        }      
    },

    start(){                      
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
        this.hp = 0;
        this.shadowState = true;
        this.reset(); 
        this.setMatch(this.userInfo);                                           
    },

    update(dt){        
        this.onContinue(dt);
        ag.on(ag.constant.EVENT_APP_STATE_CHANGE, ({ state }) => {
            if (state) {
              console.log(state);
            } else {
              console.log("应用退出到后台");
            }
          });
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
        if(this.userInfo.beginner == 0){
            this.canvas.getChildByName('noviceTeaching').active = true;                                               
        }        
        var springButton = this.UI.getChildByName('springButton');             
        springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();
        this.seed = (new Date()).getTime();            
        this.rnd = new seedRandom(this.seed);
        
        //this.getQuery();                             
        let blockNode = cc.instantiate(this.blockList[0]);        
        let block = blockNode.getComponent("block");
        blockNode.position = this.origin;
        blockNode.parent = this.blockLayer;
        this.currBlock = block;               
        this.node.position = cc.pAdd(blockNode.position,this.center);
        this.shadow.setPosition(this.node.position);
        this.addBlock();
        this.audioID2 = cc.audioEngine.play(this.audios[4], true, 0.5); 
        this.setChat('点击好友的分享链接可以和好友一起玩哦~');            
    },

    setMatch(userInfo){
        //var userInfo = localStorage.getItem('userInfo');
        //userInfo = JSON.parse(userInfo);        
        cc.audioEngine.play(this.audios,true, 0.5);
        this.match = this.canvas.getChildByName('match2');           
        this.match.getChildByName('bg').setContentSize(cc.winSize);        
        var avatar = this.match.getChildByName('sub').getChildByName('avatar');
        var avatar2 = this.match.getChildByName('sub').getChildByName('avatar2');        
        var index = Math.floor(Math.random()*this.robots[userInfo.gender-1].length);                
        var robotInfo = this.robots[userInfo.gender-1][index];
        userInfo.gender == 1?this.setMatchInfo(avatar2,robotInfo,avatar,userInfo):this.setMatchInfo(avatar,robotInfo,avatar2,userInfo);
    },

    setMatchInfo(node,info,node2,userInfo){
        node2.children[0].children[0].getComponent(cc.Sprite).spriteFrame = this.tex2D;        
        node2.children[1].children[0].getComponent(cc.Label).string = userInfo.nickName;
        var shadowInfo = this.UI.getChildByName('shadowInfo');   
        var sprite = shadowInfo.children[0].children[0].getComponent(cc.Sprite);
        var label = shadowInfo.children[1].getComponent(cc.Label);
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        var time = Math.random()*3;        
        this.scheduleOnce(function(){                        
            this.match.getChildByName('spine').getComponent(sp.Skeleton).animation = 'matching_start';
            this.match.getChildByName('sub').getComponent(cc.Animation).play();
            cc.loader.loadRes(info.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                node.children[0].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                sprite.spriteFrame = spriteFrame;
            });
            node.children[1].children[0].getComponent(cc.Label).string = info.nickName;
            label.string = info.nickName;
            label2.string = info.nickName;
            this.scheduleOnce(function(){                
                this.match.active = false;
            },1.5);
        },time);
    },

    // getQuery(){        
    //     var shadowInfo = this.UI.getChildByName('shadowInfo');   
    //     var sprite = shadowInfo.children[0].children[0].getComponent(cc.Sprite);
    //     var label = shadowInfo.children[1].getComponent(cc.Label);
    //     var matchNode = this.canvas.getChildByName('match');
    //     var msp = matchNode.getChildByName('avatar').getComponent(cc.Sprite);
    //     var mn = matchNode.getChildByName('avatar').children[0].getComponent(cc.Label);
    //     this.createImage(msp,this.userInfo.avatarUrl);
    //     mn.string = this.userInfo.nickName;
    //     var msp2 = matchNode.getChildByName('avatar2').getComponent(cc.Sprite);
    //     var mn2 = matchNode.getChildByName('avatar2').children[0].getComponent(cc.Label);
    //     var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);        
    //     if(this.userInfo.gender == 2){
    //         this.actName = this.female;
    //         this.forcedPlay(0);
    //         this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";           
    //         this.bodyAnim = this.female2;
    //         this.bodyAnim2 = this.male2;                                            
    //     }
    //     var launchOption = wx.getLaunchOptionsSync();        
    //     if(launchOption.query.data){
    //         this.launch = JSON.parse(launchOption.query.data);
    //         this.seed = this.launch.seed;
    //         this.rnd = new seedRandom(this.launch.seed);
    //         if(this.launch.gender == 1){
    //             this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";
    //             this.bodyAnim2 = this.male2;
    //         }else{
    //             this.shadow.children[0].getComponent(sp.Skeleton).animation = "G_body_stand";
    //             this.bodyAnim2 = this.female2; 
    //         }                                        
    //         this.createImage(sprite,this.launch.avatar);
    //         var url = {type:1,value:this.launch.avatar};            
    //         label.string = this.launch.nickName;
    //         label2.string = this.launch.nickName;
    //         this.fAmount = this.launch.list.length;
    //         this.createImage(msp2,this.launch.avatar);
    //         mn2.string = this.launch.nickName;
            
    //     }else{
    //         this.seed = (new Date()).getTime();            
    //         this.rnd = new seedRandom(this.seed);
    //         this.fAmount = Math.floor(Math.random()*400);            
    //         var index = localStorage.getItem('robot');
    //         var robotInfo = this.robots[this.userInfo.gender-1][index];
    //         cc.loader.loadRes(robotInfo.avatar, cc.SpriteFrame, function (err, spriteFrame) {
    //             sprite.spriteFrame = spriteFrame;
    //         });            
    //         label.string = robotInfo.nickName;
    //         label2.string = robotInfo.nickName;
    //         var url = {type:0,value:index};
    //     }
    //     this.fUrl = JSON.stringify(url);
    // },

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
        blockNode.zIndex = -1+this.amount*-1;
        this.node.setScale(this.dir,1);
        this.noviceTeaching();
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
        this.audioID = cc.audioEngine.play(this.audios[5], false, 1);                               
    },

    onPlayJump:function(){
        this.ready = false;
        cc.audioEngine.stop(this.audioID);        
        this.currBlock.jump();
        this.playAddAnim(null,false);
        this.playShadowAnim(null,false);
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
                this.batter > 3?this.playAddAnim(3,false):this.playAddAnim(this.batter,false);
                cc.audioEngine.play(this.audios[2],false, 1);                                
            }else{                
                this.batter = 0;
                var score = 1;
                cc.audioEngine.play(this.audios[1],false, 1);                
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
        this.score += num;        
        this.createCountBoard(this.node.position,num);        
        var label = this.UI.getChildByName("score").getComponent(cc.Label);
        label.string = this.score;        
        var range = Math.floor(this.score/50);
        if(range<this.content2.length&&range>0&&range!=this.rag){
            this.rag = range;
            this.setChat(this.content2[range-1]);
        }            
    },

    gameOver:function(){
        cc.audioEngine.stop(this.audioID2);
        cc.audioEngine.play(this.audios[0],false, 1);        
        this.UI.active = false;
        this.overPanel.active = true;
        this.canvas.getChildByName('mask').active = true;                
        this.overPanel.getChildByName('heart').children[0].getComponent(cc.Label).string = this.privityValue.toString();        
        this.overPanel.getChildByName('score').children[0].getComponent(cc.Label).string = this.score.toString();
        this.overPanel.getChildByName('name').children[0].getComponent(cc.Label).string = this.userInfo.nickName;                
        var range = Math.floor(this.score/200);
        if(range<4){
            this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps[range];
        }
        var effect = this.overPanel.getChildByName('effect').getComponent(sp.Skeleton);
        var body = this.overPanel.getChildByName('body').getComponent(sp.Skeleton);        
        var body2 = this.overPanel.getChildByName('body2').getComponent(sp.Skeleton);
        body.animation = this.bodyAnim[0];
        body2.animation = this.bodyAnim2[0];
        this.scheduleOnce(function(){
            if(this.score>200){
                cc.audioEngine.play(this.audios[6], true, 0.5);
                body.animation = this.bodyAnim[4];
                body2.animation = this.bodyAnim2[4];
                effect.animation = 'win_ef';
                this.scheduleOnce(function(){
                    cc.audioEngine.uncache(this.audios[6]);
                    body.animation = this.bodyAnim[2];
                    body2.animation = this.bodyAnim2[2];
                },0.38);
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
        // ag.on(ag.constant.EVENT_AUDIO_STATUS_CHANGE, (audioStatus = false) => {
        //     console.log("背景音乐关闭");
        // });

        this.scheduleOnce(function(){
            //上传分数
            ag.submitResult(
                {
                    battleId:game.battleId,
                    battleResult:{
                        battleId:game.battleId,
                        groupResult:[{
                            groupId:game.groupId,
                            result:1
                        }],
                        scoreResult:[{
                            openId:game.openId,
                            score:this.score
                        }]
                    }
                }
            ).then(() => {
                console.log("上传数据成功");
                ag.end(
                    {
                        battleId:game.battleId
                    }
                ).then(() => {
                    console.log("游戏结束!");
                });
            });
        },3);
        // wx.postMessage({
        //     message:this.score.toString(),
        //     url:this.fUrl,
        // });   
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
            var callBack =function(){chat.active = false;};
            this.scheduleOnce(callBack,3);
        }        
    },

    share(){
        var share = {
            list:this.locList,
            seed:this.seed,
            avatar:this.userInfo.avatarUrl,
            nickName:this.userInfo.nickName,
            gender:this.userInfo.gender,            
        }
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        var json = JSON.stringify(share);        
        var query = 'data='+json;
        var str = '我的天呐，我和'+label2.string+'的缘分竟然是'+this.content3[4]+'!';
        var range = Math.floor(this.score/200);
        if(range<4){
            str = '我的天呐，我和'+label2.string+'的缘分竟然是'+this.content3[range]+'!';
        }
        var imageUrl = null;
        this.score > 200?imageUrl = this.imageUrl[1]:imageUrl = this.imageUrl[0];                                                     
        // wx.shareAppMessage({
        //     title: str,
        //     imageUrl:imageUrl,
        //     query: query,            
        // });
    },    

    checkShadow:function(pos){        
        var dis = cc.pDistance(this.shadow.position,pos);
        if(dis < 20){
            cc.audioEngine.play(this.audios[3],false, 1);
            this.privityValue ++;
            if(this.privityValue <= 100)
                this.UI.getChildByName("heart").children[0].children[0].y ++;
            var label = this.UI.getChildByName("privityValue").getComponent(cc.Label);
            label.string = this.privityValue;                                   
            this.batter3++;
            this.batter3 > 5?this.playShadowAnim(4,false):this.playShadowAnim(this.batter3-1,false);
        }else{
            this.batter3 = 0;
        }
    },

    noviceTeaching(){
        var noviceNode = this.canvas.getChildByName('noviceTeaching');
        if(noviceNode.activeInHierarchy){
            switch(this.amount){
                case 2:
                noviceNode.getComponent(cc.Sprite).spriteFrame = this.noviceTex;
                break;
                case 3:
                var action = cc.fadeOut(1.0);
                noviceNode.runAction(action);
                this.userInfo.beginner = 1;
                var userInfo = JSON.stringify(this.userInfo);
                localStorage.setItem('userInfo',userInfo);                                
                break;
            }
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
        var finished = cc.callFunc(function(){this.shadowState = true},this);
        var sequence = cc.sequence(delay,spawn,finished);        
        this.shadow.runAction(sequence);
        this.shadow.setScale(this.dir,1);        
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

    diamondRevive(){
        this.revive.active = true;
        this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
    },
    
    giveUp(){
        var effect = this.stage.getChildByName('effect');              
        effect.position = this.shadow.position;
        effect.getComponent(sp.Skeleton).animation = 'break_love';
        this.scheduleOnce(this.gameOver,1);
        this.revive.active = false;        
    },    

    onClickShareButton:function(){
        this.userInfo.spring += 5;
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo',userInfo);
        this.share();        
    },

    onClickAgainButton:function(){
        cc.audioEngine.uncacheAll();
        cc.director.loadScene('01');
    },

    // onClickExit:function(){        
    //     wx.exitMiniProgram();
    // },

    checkRevive(){        
        if(this.userInfo.revive > 0){
            this.userInfo.revive --;
            var userInfo = JSON.stringify(this.userInfo);
            localStorage.setItem('userInfo',userInfo);
            this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
            this.hp--;        
            this.revive.active = false;
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
        }        
    },    

    button2(){
        this.canvas.getChildByName('match').active = false;
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
            var userInfo = JSON.stringify(this.userInfo);
            localStorage.setItem('userInfo',userInfo);
            var springButton = this.UI.getChildByName('springButton'); 
            springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();
        }        
    },

    initialization(){
        var date = (new Date()).getTime(); 
        this.userInfo = {
            spring:0,
            revive:0,
            gem:0,
            skin:0,
            date:date,
            gender:1,
            avatar:'',
            nickName:'我',
            beginner:0,
            skinLocks:[true,false,false,false,false,false,false,false,false],
        };                                               
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

    loadText(){
        this.content = new Array(
            '快一点嘛！我等到花儿都谢了',
            '你追我，如果你追到我，我就让你嘿嘿嘿!',
        );
        this.content2 = new Array(
            '跳到200分，我就和你谈恋爱!',
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
            '主人，放下手中的游戏，勇敢地与那个她（他）表白吧',
        );
        this.content3 = new Array(
            '恋人未满',
            '情窦初开',
            '魂萦梦绕',
            '情比金坚',
            '天作之合'
        );
        this.imageUrl = new Array(
            'https://h5.lexun.com/games/wx/avatar/share0.png',
            'https://h5.lexun.com/games/wx/avatar/share1.png',            
        );
        this.stamps = new Array(
            'grade_5',
            'grade_4',
            'grade_3',
            'grade_2'
        );
        this.actName4 = new Array(
            'good',
            'cool',
            'great',
            'perfect',
            'excellent'
        );
        this.actName3 = new Array(
            'body_combo01',
            'body_combo02',
            'body_combo03',
            'body_combo04',
            'body_combo05'
        );
        this.actName2 = new Array(
            'xuli',
            'ring_01',
            'ring_02',
            'ring_03'
        );        
        this.male2 = new Array(
            'boy_stand',
            'boy_lose',
            'boy_win',
            'boy_lose_loop',
            'boy_win_start'
        );
        this.female2 = new Array(
            'girl_stand',
            'girl_lose',
            'girl_win',
            'girl_lose_loop',
            'girl_win_start',
        );
        this.male = new Array(
            'body_stand',
            'body_press',
            'body_down'
        );
        this.female = new Array(
            'G_body_stand',
            'G_body_press',
            'G_body_down'
        );        
    },    
});

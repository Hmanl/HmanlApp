(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/player.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f93121r03FE1LaoYGR7wCTc', 'player', __filename);
// script/player.js

'use strict';

var seedRandom = require("seedRandom");
cc.Class({
    extends: cc.Component,

    properties: {
        blockList: [cc.Prefab],
        audios: [cc.AudioClip],
        canvas: cc.Node,
        layout: cc.Node,
        revive2: cc.Node //视频复活
    },

    onLoad: function onLoad() {
        var canvas = this.canvas.getComponent(cc.Canvas);
        if (!cc.sys.isMobile) {
            canvas.fitHeight = true;
        }
        //预加载广告
        this.preLaadADFun();
    },

    start: function start() {
        var json = localStorage.getItem('userInfo2');
        if (json) {
            this.userInfo = JSON.parse(json);
        } else {
            this.userInfo = {
                spring: 20,
                revive: 0,
                gem: 0,
                skin: 0,
                date: 111,
                gender: 1,
                avatar: '',
                nickName: '我',
                beginner: 0,
                skinLocks: [true, false, false, false, false, false, false, false, false]
            };
        }

        this.stage = this.canvas.getChildByName("layout").getChildByName('stage');
        this.shadow = this.stage.getChildByName('shadow');
        this.blockLayer = this.stage.getChildByName('blockLayer');
        this.UI = this.layout.getChildByName('UI');
        this.revive = this.layout.getChildByName('revive');
        this.overPanel = this.layout.getChildByName('overPanel');
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
        this.center = cc.p(43, 57);
        this.origin = cc.p(-250, -80);
        this.ready = true;
        this.locList = new Array();
        this.currClip = 0;
        this.continue = 0;
        this.loop = true;
        this.dur = 5;
        this.rag = 0;
        this.onFristClick = false; //点击屏幕开关

        this.range = 0;
        this.shadowState = true;
        this.lock = false;
        this.layout.getChildByName('mask').setContentSize(cc.winSize);
        this.layout.getChildByName('mask2').setContentSize(cc.winSize);
        this.reset();
    },
    touchStart: function touchStart(event) {
        this.onFristClick = true;
        this.play(1);
    },
    touchEnd: function touchEnd(event) {
        if (this.ready) {
            this.play(3);
        }
    },
    update: function update(dt) {
        this.onContinue(dt);
    },


    play: function play(i) {
        if (i > this.currClip) {
            var spine = this.node.children[1].getComponent(sp.Skeleton);
            this.actName[i] ? spine.animation = this.actName[i] : spine.animation = this.actName[0];
            this.currClip = i;
            this.getAnimDuration(i);
            this.onPlay();
        }
    },

    forcedPlay: function forcedPlay(i) {
        var spine = this.node.children[1].getComponent(sp.Skeleton);
        spine.animation = this.actName[i];
        this.currClip = i;
        this.getAnimDuration(i);
        this.onPlay();
    },

    playAddAnim: function playAddAnim(i, bool) {
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.loop = bool;
        this.actName2[i] ? spine.animation = this.actName2[i] : spine.animation = null;
    },

    playShadowAnim: function playShadowAnim(i) {
        if (lx.language == "zh") {
            var spine = this.node.children[2].getComponent(sp.Skeleton);
            spine.animation = this.actName3[i];
            var spine2 = this.layout.getChildByName('excellent').getComponent(sp.Skeleton);
            spine2.animation = this.actName4[i];
        } else {
            var spine = this.node.children[2].getComponent(sp.Skeleton);
            spine.animation = this.actName3[i];
            var spine2 = this.layout.getChildByName('excellent').getComponent(sp.Skeleton);
            spine2.animation = this.actName4_E[i];
        }
    },

    getAnimDuration: function getAnimDuration(i) {
        switch (i) {
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

    reset: function reset() {
        var springButton = this.UI.getChildByName('springButton');
        springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();

        this.hp = lx.config.adUnitId ? 1 : 0;
        this.getQuery();
        var blockNode = cc.instantiate(this.blockList[0]);
        var block = blockNode.getComponent("block");
        blockNode.position = this.origin;
        blockNode.parent = this.blockLayer;
        this.currBlock = block;
        this.node.position = cc.pAdd(blockNode.position, this.center);
        this.shadow.setPosition(this.node.position);
        this.addBlock();
        cc.audioEngine.playMusic(this.audios[4], true);
        this.setChat(lx.i18n.t("label_text.shareDesc"));
    },

    getQuery: function getQuery() {
        var shadowInfo = this.UI.getChildByName('shadowInfo');
        var sprite = shadowInfo.children[0].children[0].getComponent(cc.Sprite);
        var label = shadowInfo.children[1].getComponent(cc.Label);
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        if (this.userInfo.gender == 2) {
            this.actName = this.female;
            this.forcedPlay(0);
            this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";
            this.bodyAnim = this.female2;
            this.bodyAnim2 = this.male2;
        }
        if (typeof sharedCanvas == 'undefined') {
            this.seed = new Date().getTime();
            this.rnd = new seedRandom(this.seed);
            this.fAmount = Math.floor(Math.random() * 400);
            var index = localStorage.getItem('robot');
            var robotInfo = this.robots[this.userInfo.gender - 1][index];
            cc.loader.loadRes(robotInfo.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            });
            label.string = robotInfo.nickName;
            label2.string = robotInfo.nickName;
            var url = { type: 0, value: index };
            this.fUrl = JSON.stringify(url);
        } else {
            var launchOption = wx.getLaunchOptionsSync();
            if (launchOption.query.data) {
                this.launch = JSON.parse(launchOption.query.data);
                this.seed = this.launch.seed;
                this.rnd = new seedRandom(this.launch.seed);
                if (this.launch.gender == 1) {
                    this.shadow.children[0].getComponent(sp.Skeleton).animation = "body_stand";
                    this.bodyAnim2 = this.male2;
                } else {
                    this.shadow.children[0].getComponent(sp.Skeleton).animation = "G_body_stand";
                    this.bodyAnim2 = this.female2;
                }
                this.createImage(sprite, this.launch.avatar);
                var url = { type: 1, value: this.launch.avatar };
                label.string = this.launch.nickName;
                label2.string = this.launch.nickName;
                this.fAmount = this.launch.list.length;
            } else {
                this.seed = new Date().getTime();
                this.rnd = new seedRandom(this.seed);
                this.fAmount = Math.floor(Math.random() * 400);
                var index = localStorage.getItem('robot');
                var robotInfo = this.robots[this.userInfo.gender - 1][index];
                cc.loader.loadRes(robotInfo.avatar, cc.SpriteFrame, function (err, spriteFrame) {
                    sprite.spriteFrame = spriteFrame;
                });
                label.string = robotInfo.nickName;
                label2.string = robotInfo.nickName;
                var url = { type: 0, value: index };
            }
            this.fUrl = JSON.stringify(url);
        }
    },


    addBlock: function addBlock() {
        var n = Math.floor(this.rnd.rand() * this.blockList.length);
        var blockNode = cc.instantiate(this.blockList[n]);
        var block = blockNode.getComponent("block");
        var distance = 0;
        this.amount <= 100 ? distance = 200 + this.rnd.rand() * (200 + this.amount) : distance = 200 + this.rnd.rand() * 300;
        var direction = new cc.Vec2(Math.cos(0.556047197640118), Math.sin(0.556047197640118));
        var vec = direction.mul(distance);
        vec.x *= this.dir;
        var pos = cc.pAdd(this.currBlock.node.position, vec);
        blockNode.position = pos;
        blockNode.parent = this.blockLayer;
        this.nextBlock = block;
        this.amount++;
        if (lx.language == "zh") {
            if (this.amount == 1) this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'logo_start';
            if (this.amount == 2) this.layout.getChildByName('finger').getComponent(sp.Skeleton).animation = null;
            if (this.amount == 6) {
                this.lock = true;
                this.canvas.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
                this.canvas.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
                this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_loop';
                this.layout.getChildByName('finger').getComponent(sp.Skeleton).loop = true;
                this.layout.getChildByName('finger').getComponent(sp.Skeleton).animation = 'mouse_click';
            }
            if (this.amount == 7) {
                this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_end';
                this.layout.getChildByName('finger').destroy();
            }
        } else {
            if (this.amount == 1) this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'logo_start_E';
            if (this.amount == 2) this.layout.getChildByName('finger').getComponent(sp.Skeleton).animation = null;
            if (this.amount == 6) {
                this.lock = true;
                this.canvas.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
                this.canvas.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
                this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_loop_E';
                this.layout.getChildByName('finger').getComponent(sp.Skeleton).loop = true;
                this.layout.getChildByName('finger').getComponent(sp.Skeleton).animation = 'mouse_click_E';
            }
            if (this.amount == 7) {
                this.layout.getChildByName('followMe').getComponent(sp.Skeleton).animation = 'turn_end_E';
                this.layout.getChildByName('finger').destroy();
            }
        }

        if (this.amount == 8) this.layout.getChildByName('followMe').destroy();
        if (this.amount == 15) {
            this.lock = false;
            if (lx.config.platform != "lexun") {
                this.UI.getChildByName('aimButton').active = true;
            };
        }
        blockNode.zIndex = -1 + this.amount * -1;
        this.node.setScale(this.dir, 1);
        this.shadowJump(distance, direction, block);
    },

    onPlay: function onPlay() {
        switch (this.currClip) {
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

    onContinue: function onContinue(dt) {
        if (this.loop) {
            this.continue += dt;
            if (this.continue < this.dur) {
                switch (this.currClip) {
                    case 1:
                        this.onContinueReady(dt);
                        break;
                    case 2:
                        this.onContinueMax(dt);
                        break;
                }
            } else {
                this.loop = false;
                this.onFinished();
            }
        }
    },

    onFinished: function onFinished() {
        switch (this.currClip) {
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

    onPlayReady: function onPlayReady() {
        this.currBlock.ready();
        this.playAddAnim(0, true);
        this.ready = true;
        this.audioID = cc.audioEngine.playEffect(this.audios[5], false);
    },

    onPlayJump: function onPlayJump() {
        this.ready = false;
        cc.audioEngine.stopEffect(this.audioID);
        this.currBlock.jump();
        this.playAddAnim(null, false);
        this.playShadowAnim(null);
        var direction = new cc.Vec2(Math.cos(0.556047197640118), Math.sin(0.556047197640118));
        var vec = direction.mul(this.jumpDistance);
        vec.x *= this.dir;
        var originPos = cc.pAdd(this.currBlock.node.position, this.center);
        this.targetPos = cc.pAdd(originPos, vec);
        var jumpAction = cc.jumpTo(0.4, this.targetPos, 200, 1);
        var rotateAction = cc.rotateBy(0.4, this.dir * 360);
        var spawn = cc.spawn(jumpAction, rotateAction);
        this.node.runAction(spawn);
        this.power = 0;
    },

    onContinueReady: function onContinueReady(dt) {
        this.power += dt;
        this.jumpDistance = this.power * 500;
        this.node.y -= dt * 17.5;
        if (this.lock) {
            this.pointGroup.active = true;
            var direction = new cc.Vec2(Math.cos(0.556047197640118), Math.sin(0.556047197640118));
            var vec = direction.mul(this.jumpDistance);
            vec.x *= this.dir;
            var originPos = cc.pAdd(this.currBlock.node.position, this.center);
            originPos.subSelf(cc.v2(0, 63));
            for (var i = 0; i < 10; i++) {
                var k = 0.1 * (i + 1);
                var p1 = this.bezier(cc.v2(vec.x * 0.25, 350), vec, k);
                var tPos = cc.pAdd(originPos, p1);
                this.pointGroup.children[i].setPosition(tPos);
            }
        }
    },

    bezier: function bezier(v1, v2, t) {
        var p0 = cc.pMult(cc.v2(0, 0), Math.pow(1 - t, 2));
        var p1 = cc.pMult(v1, 2 * t * (1 - t));
        var p2 = cc.pMult(v2, Math.pow(t, 2));
        var p = cc.pAdd(p0, p1);
        p = cc.pAdd(p, p2);
        return p;
    },


    onContinueMax: function onContinueMax(dt) {
        this.power += dt;
        this.jumpDistance = this.power * 500;
    },

    onFinishedIdel: function onFinishedIdel() {
        var i = Math.floor(Math.random() * this.content.length);
        this.setChat(this.content[i]);
    },


    onFinishedReady: function onFinishedReady() {
        this.play(2);
    },

    onFinishedJump: function onFinishedJump() {
        this.pointGroup.active = false;
        var result = this.nextBlock.jumpResult(this.targetPos);
        var result2 = this.currBlock.jumpResult(this.targetPos);
        if (result) {
            this.forcedPlay(0);
            if (this.locList.length < 400) this.locList.push(Math.floor(this.jumpDistance));
            var per = this.nextBlock.jumpPerfect(this.targetPos);
            if (per) {
                this.batter++;
                var score = this.batter * 2;
                this.batter > 3 ? this.playAddAnim(3, false) : this.playAddAnim(this.batter, false);
                cc.audioEngine.playEffect(this.audios[2], false);
            } else {
                this.batter = 0;
                var score = 1;
                cc.audioEngine.playEffect(this.audios[1], false);
            }
            this.checkShadow(this.targetPos);
            score += this.batter3 * 3;
            this.setScore(score);
            this.changeDir();
            this.updateView();
            this.currBlock = this.nextBlock;
            this.addBlock();
        } else {
            if (result2) {
                this.forcedPlay(0);
                this.batter = 0;
            } else {
                this.node.parent = this.blockLayer;
                var vec = cc.pAdd(this.nextBlock.node.position, this.center);
                var index = this.nextBlock.node.zIndex;
                var d = (vec.x - this.node.x) / Math.abs(vec.x - this.node.x);
                this.node.zIndex = index + 0.5 * d * this.dir;
                var finished = cc.callFunc(function () {
                    this.hp >= 1 ? this.diamondRevive() : this.gameOver();
                }, this);
                var action = cc.sequence(cc.moveBy(0.5, cc.p(0, -85)), finished);
                this.node.runAction(action);
            }
        }
    },

    setScore: function setScore(num) {
        var score = this.UI.getChildByName('score');
        score.getChildByName('add1').getComponent(cc.Label).string = this.score.toString();
        score.getChildByName('add2').getComponent(cc.Label).string = num.toString();
        this.score += num;
        score.getChildByName('sum').getComponent(cc.Label).string = this.score.toString();
        score.getComponent(cc.Animation).play();
        this.createCountBoard(this.node.position, num);
        var range = Math.floor(this.score / 50);
        if (range < this.content2.length && range > 0 && range != this.rag) {
            this.rag = range;
            this.setChat(this.content2[range - 1]);
        }
    },

    createCountBoard: function createCountBoard(pos, count) {
        var countBoard = this.stage.getChildByName('countBoard');
        countBoard.active = true;
        countBoard.getComponent(cc.Label).string = count;
        countBoard.setPosition(pos);
        var finished = cc.callFunc(function () {
            countBoard.active = false;
        }, this);
        var action = cc.sequence(cc.moveBy(0.5, 0, 100), cc.moveBy(0.3, 0, 20), finished);
        countBoard.runAction(action);
    },

    updateView: function updateView() {
        var moveVector = cc.pSub(this.currBlock.node.position, this.nextBlock.node.position);
        if (this.batter2 == 0) {
            moveVector.x += 400 * this.dir * -1;
        }
        var action = cc.moveBy(0.5, moveVector);
        this.stage.runAction(action);
        var bg = this.layout.getChildByName('bg');
        var vec2 = bg.position.clone();
        bg.setPosition(vec2.x % 960, vec2.y % 1668);
        bg.runAction(action.clone());
        this.optimize();
    },

    changeDir: function changeDir() {
        var newDir = this.rnd.rand() > 0.5 ? 1 : -1;
        if (newDir == this.dir) {
            this.batter2++;
        } else {
            this.dir = newDir;
            this.batter2 = 0;
        }
    },

    optimize: function optimize() {
        for (var i = 0; i < this.blockLayer.children.length; i++) {
            var dis = cc.pDistance(this.blockLayer.children[i].position, this.node.position);
            if (dis > 1000) {
                this.blockLayer.children[i].destroy();
            }
        }
    },

    setChat: function setChat(str) {
        var chat = this.UI.getChildByName('chat');
        if (!chat.activeInHierarchy) {
            chat.active = true;
            chat.children[0].getComponent(cc.Label).string = str;
            var callBack = function callBack() {
                chat.active = false;
            };
            this.scheduleOnce(callBack, 3);
        }
    },


    checkShadow: function checkShadow(pos) {
        var dis = cc.pDistance(this.shadow.position, pos);
        var spine3 = this.layout.getChildByName('screenEffect').getComponent(sp.Skeleton);
        if (dis < 30) {
            cc.audioEngine.playEffect(this.audios[3], false);
            this.privityValue++;
            if (this.privityValue <= 100) this.UI.getChildByName("heart").children[0].children[0].y++;
            var label = this.UI.getChildByName("privityValue").getComponent(cc.Label);
            label.string = this.privityValue;
            this.batter3++;
            if (this.batter3 == 6) this.changeColorOfScore(cc.Color.ORANGE);
            if (this.batter3 == 12) {
                this.changeColorOfScore(cc.Color.MAGENTA);
                this.UI.getChildByName('effect').active = true;
            }
            var hit = this.layout.getChildByName('hit');
            hit.getComponent(cc.Label).string = this.batter3 + lx.i18n.t("label_text.combo");
            var action2 = cc.sequence(cc.fadeIn(0.2), cc.delayTime(0.5), cc.fadeOut(0.3));
            hit.runAction(action2);
            //this.batter3 > 5?this.playShadowAnim(4):this.playShadowAnim(this.batter3-1);
            var range = Math.floor(this.batter3 / 3);
            range > 4 ? this.playShadowAnim(4) : this.playShadowAnim(range);
            if (range > 0 && this.range != range && range < 6) {
                var mask = this.layout.getChildByName('mask2');
                if (mask.opacity == 0) {
                    mask.opacity = 153;
                }
                this.range = range;
                spine3.animation = this.actName5[range - 1];
            }
        } else {
            this.batter3 = 0;
            var effect = this.UI.getChildByName('effect');
            if (effect) {
                effect.active = false;
                this.changeColorOfScore(cc.Color.WHITE);
            }
            var mask = this.layout.getChildByName('mask2');
            if (mask.opacity > 0) {
                mask.opacity = 0;
                this.range = 0;
            }
            spine3.animation = null;
        }
    },

    changeColorOfScore: function changeColorOfScore(col) {
        var score = this.UI.getChildByName('score');
        score.getChildByName('add2').children[0].color = col;
        for (var i = 0; i < score.children.length; i++) {
            score.children[i].color = col;
        }
    },
    shadowJump: function shadowJump(distance, direction, block) {
        this.shadowState = false;
        if (this.launch && this.launch.list[this.amount - 1]) {
            var pDis = this.launch.list[this.amount - 1];
        } else {
            var pDis = distance + (Math.random() * 2 - 1) * (block.radius - 20);
        }
        var pVec = direction.mul(pDis);
        pVec.x *= this.dir;
        var originPos = cc.pAdd(this.currBlock.node.position, this.center);
        var targetPos = cc.pAdd(originPos, pVec);
        var jumpAction = cc.jumpTo(0.4, targetPos, 200, 1);
        var rotateAction = cc.rotateBy(0.4, this.dir * 360);
        var spawn = cc.spawn(jumpAction, rotateAction);
        var delay = cc.delayTime(0.3);
        var finished = cc.callFunc(function () {
            this.shadowState = true;
            if (this.amount < 6) {
                if (this.amount == 1) {
                    this.play(1);
                    this.layout.getChildByName('finger').getComponent(sp.Skeleton).animation = 'mouse_click3';
                    this.scheduleOnce(function () {
                        var originPos = cc.pAdd(this.currBlock.node.position, this.center);
                        this.jumpDistance = cc.pDistance(originPos, this.shadow.position);
                        this.play(3);
                    }, 0.7);
                } else {
                    var originPos = cc.pAdd(this.currBlock.node.position, this.center);
                    this.jumpDistance = cc.pDistance(originPos, this.shadow.position);
                    this.play(3);
                }
            }
        }, this);
        var sequence = cc.sequence(delay, spawn, finished);
        this.shadow.runAction(sequence);
        this.shadow.setScale(this.dir, 1);
    },


    createImage: function createImage(sprite, url) {
        if (url) {
            var image = wx.createImage();
            image.onload = function () {
                var texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            };
            image.src = url;
        }
    },

    diamondRevive: function diamondRevive() {
        this.revive.active = true;
        this.layout.getChildByName('mask').active = true;
        this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
    },
    giveUp: function giveUp() {
        var effect = this.stage.getChildByName('effect');
        effect.position = this.shadow.position;
        this.layout.getChildByName('mask').active = false;
        effect.getComponent(sp.Skeleton).animation = 'break_love';
        this.scheduleOnce(this.gameOver, 1);
        this.revive.active = false;
    },


    onClickShareButton: function onClickShareButton() {
        var share = {
            list: this.locList,
            seed: this.seed,
            avatar: this.userInfo.avatar,
            nickName: this.userInfo.nickName,
            gender: this.userInfo.gender
        };
        var label2 = this.overPanel.getChildByName('name2').children[0].getComponent(cc.Label);
        var json = JSON.stringify(share);
        var query = 'data=' + json;
        var range = Math.floor(this.score / 200);
        if (range > 4) range = 4;
        var str = lx.i18n.t("label_text.fate_1") + label2.string + lx.i18n.t("label_text.fate_2") + this.content3[range] + '!';
        var imageUrl = null;
        if (lx.language == "zh") {
            this.score > 200 ? imageUrl = this.imageUrl[1] : imageUrl = this.imageUrl[0];
        } else {
            this.score > 200 ? imageUrl = this.imageUrl_E[1] : imageUrl = this.imageUrl_E[0];
        }
        lx.shareAppMessage({
            title: str,
            imageUrl: imageUrl,
            query: query,
            success: function () {}.bind(this)
        });
    },

    checkRevive: function checkRevive() {
        if (this.userInfo.revive > 0) {
            this.userInfo.revive--;
            this.revive.getChildByName('info').children[0].getComponent(cc.Label).string = this.userInfo.revive.toString();
            this.reviving();
        } else {
            this.setTooltip(lx.i18n.t("label_text.Resurrection_3"));
        }
    },
    reviving: function reviving() {
        this.hp--;
        this.revive.active = false;
        this.layout.getChildByName('mask').active = false;
        var center = cc.pAdd(this.currBlock.node.position, this.center);
        var effect = this.stage.getChildByName('effect');
        effect.setPosition(center);
        if (lx.language == "zh") {
            effect.getComponent(sp.Skeleton).animation = 'revive';
        } else {
            effect.getComponent(sp.Skeleton).animation = 'revive_E';
        }
        var callBack = function callBack() {
            this.forcedPlay(0);
        };
        this.scheduleOnce(callBack, 1.5);
        this.batter = 0;
        this.node.zIndex = 1;
        this.node.setPosition(center);
        this.node.parent = this.stage;
    },
    setTooltip: function setTooltip(str) {
        var node = this.layout.getChildByName('label');
        if (!node.activeInHierarchy) {
            node.active = true;
            node.children[0].getComponent(cc.Label).string = str;
            var finished = cc.callFunc(function () {
                node.setPosition(-700, 0);
                node.active = false;
            }, this);
            var action = cc.sequence(cc.moveBy(0.3, cc.v2(700, 0)), cc.delayTime(2), cc.moveBy(0.3, cc.v2(700, 0)), finished);
            node.runAction(action);
        }
    },
    displayAD: function displayAD(event, type) {
        if (!lx.config.adUnitId) {
            return;
        }
        var self = this;
        lx.showRewardedVideoAd({
            adUnitId: lx.config.adUnitId,
            success: function (res) {
                self.Loadad = false;
                self.preLaadADFun();
                if (type) {
                    switch (type) {
                        case 'spring':
                            this.updateSpringCount(3);
                            break;
                        case 'aim':
                            this.unlockAim();
                            break;
                    }
                } else {
                    res.isEnded ? self.reviving() : self.setTooltip(lx.i18n.t("label_text.adv_1"));
                }
            }.bind(this),
            fail: function fail(err) {
                console.log('error ', err);
                self.setTooltip(lx.i18n.t("label_text.adv_2"));
            },
            complete: function complete() {
                self.revive2.getComponent(cc.Button).interactable = true;
            }
        });
        self.revive2.getComponent(cc.Button).interactable = false;
    },


    //预加载广告
    preLaadADFun: function preLaadADFun() {
        if (lx.loadRewardedVideoAd) {
            var object = {
                adUnitId: lx.config.adUnitId,
                success: function (res) {
                    this.Loadad = true;
                }.bind(this),
                fail: function (err) {}.bind(this),
                complete: function () {}.bind(this)
            };
            lx.loadRewardedVideoAd(object);
        }
    },

    checkBackButton: function checkBackButton() {
        this.overPanel.active = true;
        this.layout.getChildByName('subCanvas').active = false;
        this.layout.getChildByName('back').active = false;
    },
    onClickRank: function onClickRank() {
        this.overPanel.active = false;
        this.layout.getChildByName('subCanvas').active = true;
        this.layout.getChildByName('back').active = true;
    },


    //点击精准打击
    onClickPerfectButton: function onClickPerfectButton(event) {
        if (this.userInfo.spring == 0) {
            if (lx.language == "zh") {
                this.setTooltip(lx.i18n.t("label_text.fate_3"));
            } else {
                this.Loadad ? this.displayAD(event, 'spring') : this.setTooltip(lx.i18n.t("label_text.adv_2"));;
            }
        }
        if (this.shadowState && this.userInfo.spring > 0 && this.currClip == 0) {
            var originPos = cc.pAdd(this.currBlock.node.position, this.center);
            this.jumpDistance = cc.pDistance(originPos, this.shadow.position);
            this.play(3);
            this.updateSpringCount(-1);
        }
    },
    updateSpringCount: function updateSpringCount(num) {
        this.userInfo.spring += num;
        var springButton = this.UI.getChildByName('springButton');
        springButton.children[0].children[0].getComponent(cc.Label).string = this.userInfo.spring.toString();
    },
    onClickAimButton: function onClickAimButton() {
        if (this.currClip == 0) {
            this.layout.getChildByName('mask').active = true;
            this.layout.getChildByName('aimShare').active = true;
        }
    },
    onClickAimShareButton: function onClickAimShareButton(event) {
        if (typeof sharedCanvas == 'undefined') {
            if (lx.language == "zh") {
                this.unlockAim();
            } else {
                this.displayAD(event, 'aim');
            }
        } else {
            var i = Math.floor(Math.random() * this.shareText.length);
            if (lx.language == "zh") {
                var shareContent = this.shareText;
            } else {
                var shareContent = this.shareText_E;
            }
            wx.shareAppMessage({
                title: shareContent[i].str,
                imageUrl: shareContent[i].url,
                success: function () {
                    this.unlockAim();
                }.bind(this)
            });
        }
    },
    unlockAim: function unlockAim() {
        this.lock = true;
        this.layout.getChildByName('aimShare').destroy();
        this.UI.getChildByName('aimButton').destroy();
        this.layout.getChildByName('mask').active = false;
    },
    onClickAimExitButton: function onClickAimExitButton() {
        this.layout.getChildByName('mask').active = false;
        this.layout.getChildByName('aimShare').active = false;
    },
    onChangeScenes: function onChangeScenes(event, scenes) {
        var userInfo = JSON.stringify(this.userInfo);
        localStorage.setItem('userInfo2', userInfo);
        scenes == 'exit' ? wx.exitMiniProgram() : cc.director.loadScene(scenes);
    },


    gameOver: function gameOver() {
        cc.audioEngine.playMusic(this.audios[0], false);
        this.UI.active = false;
        this.overPanel.active = true;
        this.layout.getChildByName('mask').active = true;
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
        this.schedule(function () {
            score += 10;
            this.overPanel.getChildByName('score').children[0].getComponent(cc.Label).string = score.toString();
        }, 0.02, this.privityValue, 1.7);
        this.scheduleOnce(function () {
            if (lx.language == "zh") {
                var range = Math.floor(this.score / 200);
                range < 4 ? this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps[range] : this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps[4];
            } else {
                var range = Math.floor(this.score / 200);
                range < 4 ? this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps_E[range] : this.overPanel.getChildByName('stamp').getComponent(sp.Skeleton).animation = this.stamps_E[4];
            }
            this.scheduleOnce(function () {
                if (this.score > 200) {
                    cc.audioEngine.playEffect(this.audios[6], false);
                    body.animation = this.bodyAnim[4];
                    body2.animation = this.bodyAnim2[4];
                    effect.animation = 'win_ef';
                    this.scheduleOnce(function () {
                        body.animation = this.bodyAnim[2];
                        body2.animation = this.bodyAnim2[2];
                    }, 0.35);
                } else {
                    body.animation = this.bodyAnim[1];
                    body2.animation = this.bodyAnim2[1];
                    this.scheduleOnce(function () {
                        effect.animation = 'lose_ef';
                    }, 1);
                    this.scheduleOnce(function () {
                        body.animation = this.bodyAnim[3];
                        body2.animation = this.bodyAnim2[3];
                    }, 1.48);
                }
            }, 0.4);
        }, 1.7 + this.privityValue * 0.02);
        lx.utils.safeCall(lx.showCustomView, {
            code: "game_over",
            data: {
                score: this.privityValue, // 默契值(上面分数)
                bottomScore: this.score, // 心动值(下面分数)
                title: lx.i18n.t("label_text.score")
            },
            success: function success(view, options) {
                // console.log("成功...",view, options);
            }
        });
        if (typeof sharedCanvas == 'undefined') {
            // this.overPanel.getChildByName('privityButton').active = false;
            // this.overPanel.getChildByName('bunny').active = false;
            this.overPanel.getChildByName('exit').active = false;
            var key = lx.config.platform == "fbinstant" ? 'user_score' : "userScore";
            lx.getUserCloudStorage({
                key: key,
                success: function (data) {
                    if (data) {
                        var preScore = data.value && data.value.game.score || 0;
                        if (preScore < this.score) {
                            lx.setUserCloudStorage({
                                kvdata: {
                                    key: key,
                                    value: {
                                        game: {
                                            score: this.score,
                                            update_time: new Date().getTime()
                                        }
                                    }
                                }
                            });
                        }
                    } else {
                        lx.setUserCloudStorage({
                            kvdata: {
                                key: key,
                                value: {
                                    game: {
                                        score: this.score,
                                        update_time: new Date().getTime()
                                    }
                                }
                            }
                        });
                    }
                }.bind(this)
            });
        } else {
            wx.postMessage({
                message: this.score.toString(),
                url: this.fUrl
            });
        }
    },

    loadRobotInfo: function loadRobotInfo() {
        this.robots = [[], []];
        this.createRobot(1, 'avatar/0', lx.i18n.t("label_text.robotId_1"));
        this.createRobot(0, 'avatar/1', lx.i18n.t("label_text.robotId_2"));
        this.createRobot(1, 'avatar/2', lx.i18n.t("label_text.robotId_3"));
        this.createRobot(1, 'avatar/3', lx.i18n.t("label_text.robotId_4"));
        this.createRobot(0, 'avatar/4', lx.i18n.t("label_text.robotId_5"));
        this.createRobot(0, 'avatar/5', lx.i18n.t("label_text.robotId_6"));
        this.createRobot(1, 'avatar/6', lx.i18n.t("label_text.robotId_7"));
        this.createRobot(0, 'avatar/7', lx.i18n.t("label_text.robotId_8"));
        this.createRobot(0, 'avatar/8', lx.i18n.t("label_text.robotId_9"));
        this.createRobot(0, 'avatar/9', lx.i18n.t("label_text.robotId_10"));
    },
    createRobot: function createRobot(type, path, nickName) {
        var robot = {
            avatar: path,
            nickName: nickName
        };
        this.robots[type].push(robot);
    },
    loadText: function loadText() {
        this.content = [lx.i18n.t("label_text.content_1"), lx.i18n.t("label_text.content_2")];
        this.content2 = [lx.i18n.t("label_text.content2_1"), lx.i18n.t("label_text.content2_2"), lx.i18n.t("label_text.content2_3"), lx.i18n.t("label_text.content2_4"), lx.i18n.t("label_text.content2_5"), lx.i18n.t("label_text.content2_6"), lx.i18n.t("label_text.content2_7"), lx.i18n.t("label_text.content2_8"), lx.i18n.t("label_text.content2_9"), lx.i18n.t("label_text.content2_10"), lx.i18n.t("label_text.content2_11"), lx.i18n.t("label_text.content2_12"), lx.i18n.t("label_text.content2_13"), lx.i18n.t("label_text.content2_14"), lx.i18n.t("label_text.content2_15"), lx.i18n.t("label_text.content2_16")];
        this.content3 = [lx.i18n.t("label_text.content3_1"), lx.i18n.t("label_text.content3_2"), lx.i18n.t("label_text.content3_3"), lx.i18n.t("label_text.content3_4"), lx.i18n.t("label_text.content3_5")];
        this.imageUrl = ['https://h5.lexun.com/games/wx/avatar/share0.png', 'https://h5.lexun.com/games/wx/avatar/share1.png'];
        this.imageUrl_E = ["https://h5.lexun.com/games/fb/avatar/g01.jpg", "https://h5.lexun.com/games/fb/avatar/g01.jpg"];
        this.stamps = ['grade_5', 'grade_4', 'grade_3', 'grade_2', 'grade_1'];
        this.stamps_E = ['E_grade_5', 'E_grade_4', 'E_grade_3', 'E_grade_2', 'E_grade_1'];
        this.actName5 = ['combo_01', 'combo_02', 'combo_03', 'combo_04', 'combo_05'];
        this.actName4 = ['good', 'cool', 'great', 'perfect', 'excellent'];
        this.actName4_E = ['good_E', 'cool_E', 'great_E', 'perfect_E', 'excellent_E'];
        this.actName3 = ['body_combo01', 'body_combo02', 'body_combo03', 'body_combo04', 'body_combo05'];
        this.actName2 = ['xuli', 'ring_01', 'ring_02', 'ring_03'];
        this.male2 = ['boy_stand', 'boy_lose', 'boy_win', 'boy_lose_loop', 'boy_win_start'];
        this.female2 = ['girl_stand', 'girl_lose', 'girl_win', 'girl_lose_loop', 'girl_win_start'];
        this.male = ['body_stand', 'body_press', 'body_down'];
        this.female = ['G_body_stand', 'G_body_press', 'G_body_down'];
        //中文
        this.shareText = [{
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/wx/avatar/share4.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText2"),
            url: 'https://h5.lexun.com/games/wx/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText3"),
            url: 'https://h5.lexun.com/games/wx/avatar/g03.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText4"),
            url: 'https://h5.lexun.com/games/wx/avatar/g05.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText5"),
            url: 'https://h5.lexun.com/games/wx/avatar/g06.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText6"),
            url: 'https://h5.lexun.com/games/wx/avatar/g07.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText7"),
            url: 'https://h5.lexun.com/games/wx/avatar/g08.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText8"),
            url: 'https://h5.lexun.com/games/wx/avatar/g09.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText9"),
            url: 'https://h5.lexun.com/games/wx/avatar/g10.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText10"),
            url: 'https://h5.lexun.com/games/wx/avatar/g11.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText11"),
            url: 'https://h5.lexun.com/games/wx/avatar/g12.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText12"),
            url: 'https://h5.lexun.com/games/wx/avatar/g13.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText13"),
            url: 'https://h5.lexun.com/games/wx/avatar/g14.jpg'
        }];
        //英文
        this.shareText_E = [{
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }, {
            str: lx.i18n.t("label_text.shareText1"),
            url: 'https://h5.lexun.com/games/fb/avatar/g01.jpg'
        }];
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=player.js.map
        
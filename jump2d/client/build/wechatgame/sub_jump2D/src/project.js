require=function i(n,s,c){function u(e,t){if(!s[e]){if(!n[e]){var a="function"==typeof require&&require;if(!t&&a)return a(e,!0);if(h)return h(e,!0);var r=new Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[e]={exports:{}};n[e][0].call(o.exports,function(t){return u(n[e][1][t]||t)},o,o.exports,i,n,s,c)}return s[e].exports}for(var h="function"==typeof require&&require,t=0;t<c.length;t++)u(c[t]);return u}({lanuch:[function(t,e,a){"use strict";cc._RF.push(e,"8bccb29bVtEb5jlzN7I5qKO","lanuch"),cc.Class({extends:cc.Component,properties:{content:cc.Node,prefabs:[cc.Prefab],selfNode:cc.Node,rng:[cc.SpriteFrame],stamp:[cc.SpriteFrame]},start:function(){var e=this;this.loadRobotInfo(),this._show(),wx.onMessage(function(t){e.currScore=parseInt(t.message),e.friendUrl=t.url,wx.getUserCloudStorage({keyList:["score"],success:e.getUserCloudStorage.bind(e)})})},_show:function(){this.content.removeAllChildren(),wx.getUserInfo({openIdList:["selfOpenId"],success:this.getUserInfo.bind(this)})},getUserInfo:function(t){this.userInfo=t.data[0],wx.getFriendCloudStorage({keyList:["score","avatar4"],success:this.getFriendCloudStorage.bind(this)})},getFriendCloudStorage:function(t){if(console.log("info ",t),!(t.length<=0)){for(var e=0;e<t.data.length-1;e++)for(var a=0;a<t.data.length-1-e;a++){if(parseInt(t.data[a].KVDataList[0].value)<parseInt(t.data[a+1].KVDataList[0].value)){var r=t.data[a+1];t.data[a+1]=t.data[a],t.data[a]=r}}for(var o=0;o<t.data.length;o++){var i=null;i=(o+2)%2==0?cc.instantiate(this.prefabs[0]):cc.instantiate(this.prefabs[1]),this.writeInfo(i,t.data[o],o),t.data[o].nickname==this.userInfo.nickName&&this.writeInfo(this.selfNode,t.data[o],o),i.parent=this.content}}},writeInfo:function(t,e,a){var r=t.getChildByName("avatar").getComponent(cc.Sprite);this.createImage(r,e.avatarUrl),t.getChildByName("name").getComponent(cc.Label).string=e.nickname,t.getChildByName("score").getComponent(cc.Label).string=e.KVDataList[0].value,t.getChildByName("rank").getComponent(cc.Label).string=(a+1).toString(),a<3&&(t.getChildByName("rank2").getComponent(cc.Sprite).spriteFrame=this.rng[a]);var o=Math.floor(e.KVDataList[0].value/200);if(o<4&&(t.getChildByName("stamp").getComponent(cc.Sprite).spriteFrame=this.stamp[o]),e.KVDataList[1]){var i=JSON.parse(e.KVDataList[1].value);if(0==i.type){var n=this.userInfo.gender;0==n&&(n=1);var s=this.robots[n-1][i.value],c=t.getChildByName("avatar2").getComponent(cc.Sprite);this.setSprite(c,s.avatar)}else{var u=t.getChildByName("avatar2").getComponent(cc.Sprite);this.createImage(u,i.value)}}},setSprite:function(a,t){cc.loader.loadRes(t,cc.SpriteFrame,function(t,e){a.spriteFrame=e})},createImage:function(e,t){if(t){var a=wx.createImage();a.onload=function(){var t=new cc.Texture2D;t.initWithElement(a),t.handleLoadedTexture(),e.spriteFrame=new cc.SpriteFrame(t)},a.src=t}},getUserCloudStorage:function(t){var e=0;if(t.KVDataList[0])e=parseInt(t.KVDataList[0].value);if(this.currScore>e){var a={key:"score",value:this.currScore.toString()},r={key:"avatar4",value:this.friendUrl};lx.setUserCloudStorage({KVDataList:[a,r]}),this._show()}},loadRobotInfo:function(){var t=new Array,e=new Array;this.robots=new Array(t,e),this.createRobot(1,"avatar/0","無悪不作"),this.createRobot(0,"avatar/1","兔兔"),this.createRobot(1,"avatar/2","佛爷"),this.createRobot(1,"avatar/3","吧唧先生"),this.createRobot(0,"avatar/4","小兔几"),this.createRobot(0,"avatar/5","很酷只撩你"),this.createRobot(1,"avatar/6","油焖大侠"),this.createRobot(0,"avatar/7","浅浅淡淡"),this.createRobot(0,"avatar/8","柒七"),this.createRobot(0,"avatar/9","灯下孤影")},createRobot:function(t,e,a){var r={avatar:e,nickName:a};this.robots[t].push(r)}}),cc._RF.pop()},{}]},{},["lanuch"]);
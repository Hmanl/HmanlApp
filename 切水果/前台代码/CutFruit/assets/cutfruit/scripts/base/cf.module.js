var lxComp = require("lx.comp");
var butils = require("cf.butils");

cc.Class({
    extends: lxComp,

    /**
     *属性 
     */
    properties:{
        sceneid: 1800,
    },

    /**
     * 初始化
     */
    onLoad: function () {
        this.eventer.on("lx.user.enter", this.onUserEnter, this);
        this.eventer.on("game.scene.back", this.onSceneGoBack, this);
        this.eventer.on("lx.game.ready", this.onGameReady, this);
        this.eventer.on("lx.user.kicked,lx.user.quit", this.onUserQuit, this);
    },

    /**
     * 可用
     */
    onEnable: function(){
        this.scheduleOnce(function(){
            this.onGameReady();
        }.bind(this), 0);
    },

    /**
     * 登陆成功游戏初始化
     */
    onGameReady: function() {
        var url = window.location.href;
        var roomid = butils.getSearchParamValue(url, "roomid");
        url = url.replace(/roomid=\d+(&?)/g, '');
        window.history.pushState({}, 0, url);	
        this.connector.send("lx.user.enter", {sceneid: this.sceneid, param: '{"roomid": ' + roomid + '}'});
    },
	
    /**
     * 返回上一个场景
     */
    onSceneGoBack: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var nBack = this.nBack;
        if(!data || !data.name) {
            this.backGame = null;
            nBack.active = false;
            return;
        }

        this.backGame = {name: data.name};
        nBack.active = true;
    },

    /**
     * 返回
     */
    goBack: function(){
        if(!this.backGame || !this.backGame.name) return;
        
        this.preloadScene(this.backGame.name);
        this.connector.send("lx.user.quit");
    },

    /**
     * 玩家进入
     */
    onUserEnter: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(data.issuccess > 0) return;

        if(this.backGame){
            this.dialog.showAlert("cc.user.enter", "提示", data.msg || data.errormsg);
            return;
        }
        this.eventer.emit("base.offline", {msg: data.msg || data.errormsg});
    },

    /**
     * 玩家下线处理
     */
    onUserQuit: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(this.userinfo.sceneid != this.sceneid) return;

        if(data.issuccess <= 0){
            this.dialog.showAlert("cc.user.quit", "提示", data.msg || data.errormsg);
            return;
        }
        if(this.backGame && this.backGame.name){
            this.loadSceneByDefault(this.backGame.name);
            this.onSceneGoBack();
        }else{
            this.eventer.emit("base.offline", {msg: data.msg || data.errormsg});
        }
    },
});

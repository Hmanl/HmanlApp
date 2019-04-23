var lxComp = require("lx.comp");

cc.Class({
    extends: lxComp,

    /**
     * 属性
     */
    properties: {
        sceneName: "splash",
        gameid: 800,
        modulePrefab: cc.Prefab,
        nProgressBar: cc.ProgressBar,
    },

    /**
     * 初始化
     */
    onLoad: function () {
	    lx.config.set({
            gameid: this.gameid, 
            mode : "production"
        });  
        this.initModule();
    },

    /**
     * 可用
     */
    onEnable: function(){
        this.initEventer();  
        this.preloadScene(this.sceneName);
    },

    /**
     * 不可用
    */
    onDisable: function(){
        this.targetOffEvent(); 
    },

    /**
     * 初始化连接
     */
    initModule: function(){
        this._baseInit({module: this.modulePrefab, gameid: this.gameid}); 
    },

    /**
     * 初始化连接
     */
    initEventer: function(){
        this.eventer.on("lx.game.ready", this.onGameReady, this);
    },

    /**
     * 进入游戏(处理)
     */
    onGameReady: function(){
        //this.connector.send("lx.user.enter", {sceneid: 800});
        this.loadScene(this.sceneName);
    },

    /**
     * 预加载
     */
    preloadScene: function(sceneName, callback){
        if(!this.preloadCall) {
            this.preloadCall = [];
            callback && this.preloadCall.push(callback);
        }else{
            callback && this.preloadCall.push(callback);
            return;
        }
    
        var progressBar = this.nProgressBar;
        var onProgress = function(percent, completedCount, totalCount, item){
            percent = isNaN(percent) ? 100 : percent;
            progressBar.progress = percent / 100;
        }.bind(this);
        var onPreLaunched = function(){
            if(this.preloadCall){
                this.preloadCall.forEach(func => { func(); });
            }
            this.preloadCall = null;
        }.bind(this);
        lxComp.prototype.preloadScene.apply(this, [sceneName, onProgress, onPreLaunched]);
    },  

    /**
     * 加载场景
     */
    loadScene: function(sceneName, callback){
        this.preloadScene(sceneName, function(){
            lxComp.prototype.loadScene.apply(this, [sceneName, callback]);
        }.bind(this));
    },
});
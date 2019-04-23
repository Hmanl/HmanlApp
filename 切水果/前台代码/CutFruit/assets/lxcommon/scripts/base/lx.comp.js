var lxUtils = require("lx.utils"),
    Storage = require("lx.storage"),
    _storage = null,
    _eventer = null,
	_connector = null,
	_audior = null,
	_dialog = null,
    _inited = false,
    _userinfo = {},
    _nModule = null,
    empty = function(){};

/**
 * 基类
 */
cc.Class({
    /**
     * 基础cc组件
     */
    extends: cc.Component,

    /**
     * 属性
     */
    properties: {
        /**
         * 存储容器
         */
        storage: {
            type: empty,
            get: function(){
                return _storage;
            },
            visible: false
        },

        /**
         * 事件分发器
         */
        eventer: {
            type: empty,
            get: function(){
                return _eventer;
            },
            visible: false,
        },

        /**
         * 音频
         */
        audior: {
            type: empty,
            get: function(){
                return _audior;
            },
            visible: false,
        },

        /**
         * 对话框
         */
        dialog: {
            type: empty,
            get: function(){
                return _dialog;
            },
            visible: false,
        },

        /**
         * 连接器
         */
        connector: {
            type: empty,
            get: function(){
                return _connector;
            },
            visible: false,
        },

        /**
         * 连接器
         */
        userinfo: {
            type: empty,
            get: function(){
                return _userinfo;
            },
            visible: false,
        },
    },

    /**
     * 基础初始化
     */
    _baseInit: function(data){
        if(_inited) return;
        _inited = true;

        if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
            cc.renderer.enableDirtyRegion(false);
        }

        if(data && data.module){
            _nModule = cc.instantiate(data.module);
            cc.game.addPersistRootNode(_nModule); 
            _storage = new Storage();
            _eventer = _nModule.getComponent("lx.eventer");
            _audior = _nModule.getComponent("lx.audior");
            _dialog = _nModule.getComponent("lx.dialog");
            _connector = _nModule.getComponent("lx.connector");
            _nModule.getComponent("lx.module").init(data.gameid);
        }
        
        var aInfo = lxUtils.getAccountInfo();
        _userinfo.pstring = aInfo.account;
        _userinfo.pkey = aInfo.password;
    },

    /**
     * 设置用户信息
     */
    _setUserInfo: function(info){
        info.gameid && (_userinfo.gameid = info.gameid);
        info.pstring && (_userinfo.pstring = info.pstring);
        info.pkey && (_userinfo.pkey = info.pkey);
        info.userid && (_userinfo.userid = info.userid);
        info.nick && (_userinfo.nick = info.nick);
        info.headimg && (_userinfo.headimg = info.headimg);
        info.sceneid && (_userinfo.sceneid = info.sceneid);
    },
    
    /**
     * 获得模块节点
     */
    getModuleNode: function () {
        return _nModule;
    },

    /**
     * 检查是否初始化
     */
    chekInited: function(){
        if(!_inited){
            cc.director.loadScene("splash", function(){
                cc.director.resume();
            }.bind(this));
            cc.director.pause();
            return false
        }
        return true;
    },

    /**
     * 添加节点通过预制
     */
    addChildByPrefab: function(parent, path, onSuccess, onFailure){
        if(!lxUtils.isNode(parent) || !path || !lxUtils.isString(path)) {
            onFailure && onFailure("参数异常!");
            return false;
        }
        var name = path.substr(path.lastIndexOf("/") + 1);
        var cNode = parent.getChildByName(name);
        if(cNode){
            onSuccess && onSuccess(cNode);
            return true;
        }
        
        this.loadRes(path, function(prefab){
            var cNode = cc.instantiate(prefab);
            cNode.name = name;
            cNode.active = false;
            parent.addChild(cNode);
            onSuccess && onSuccess(cNode);
        }, function(err){
            onFailure && onFailure(err);
        }, function(){
			this.dialog.hideLoading("loadPrefab");
        }.bind(this));
        this.dialog.showLoading("loadPrefab");
        return true;
    },

    /**
     * 加载资源
     */
    loadRes: function(path, onSuccess, onFailure, onComplate){
        if(!lxUtils.isString(path)) {
            onFailure && onFailure("参数异常!");
            onComplate && onComplate();
            return false;
        }
        cc.loader.loadRes(path, function(err, prefab){
            if(err){
                onFailure && onFailure(err);
                onComplate && onComplate();
                return;
            }
            onSuccess && onSuccess(prefab);
            onComplate && onComplate();
        });
        return true;
    },

    /**
     * 预加载场景
     */
    preloadScene: function(sceneName, onProgress, onLoaded){
        if(!lxUtils.isString(sceneName) || this._isPreLoadingScene) return;

        if(onProgress && typeof(onProgress) === 'function'){
            cc.loader.onProgress = function (completedCount, totalCount, item) {
                var percent = (100 * completedCount / totalCount).toFixed(2);
                onProgress(percent, completedCount, totalCount, item);
            };    
        }
        cc.director.preloadScene(sceneName, function() {
            onProgress && (cc.loader.onProgress = null);
            onLoaded && onLoaded();
        }.bind(this));
    },

    /**     
     * 通过场景名称进行加载场景。
     */
    loadScene: function(sceneName, onLaunched){
        if(!lxUtils.isString(sceneName) || this._isLoadingScene) return;

        this._isLoadingScene = true;
        return cc.director.loadScene(sceneName, function(){
            onLaunched && onLaunched();
            this._isLoadingScene = false;
        }.bind(this));
    },

    /**
     * 默认模式加载场景
     */
    loadSceneByDefault: function(sceneName, callback){
        if(!sceneName) return;

        var onLaunched = function(){
            this.dialog.hideTips("loadScene");
            callback && callback();
        }.bind(this);
        
        var onProgress = function(percent, completedCount, totalCount, item){
            percent = isNaN(percent) ? 100 : percent;
            this.dialog.updateTips("loadScene", "加载中" + percent + "%");
        }.bind(this);

        var onPreLaunched = function(){
            this.loadScene(sceneName, onLaunched);
        }.bind(this);

        //cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, fonLaunched);
        this.dialog.showTips("loadScene", "加载中,请等待....");
        this.preloadScene(sceneName, onProgress, onPreLaunched);
    },

    /**
     * 抛出异常
     * msg: 异常消息
     * func: 异常函数
     */
    thowExcept: function(msg, func){
        throw {classname: this.__classname__, message: message, function: typeof(func) === 'function' && func.name || func};
    },

    /**
     * 清除所有事件
     */
    targetOffEvent: function(){
        this.eventer && this.eventer.targetOff(this);
    },
});
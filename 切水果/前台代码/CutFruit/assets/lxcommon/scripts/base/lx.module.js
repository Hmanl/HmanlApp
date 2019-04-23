var eventer = require("lx.eventer");
var dialog = require("lx.dialog");
var audior = require("lx.audior");
var connector = require("lx.connector");
var butils = require("lx.utils");
var lxComp = require("lx.comp");
var lxNodePool = require("lx.nodePool");
var httpUtils = require("lx.httputils");

cc.Class({
    extends: lxComp,

    /**
     * 初始化
     */
    init: function(gameid){
        this._setUserInfo({gameid: gameid});
        this.initEventer();
        this.initConnector();
        this.initExtraModule();
    },

    /**
     * 初始化事件
     */
    initEventer: function(){
        this.eventer.on('base.connected', this.onConnected, this);
        this.eventer.on('base.sceneid', this.onSceneid, this);
        this.eventer.on('base.connectError', this.onConnectError, this);
        this.eventer.on('base.disconnected', this.onDisconnected, this);
        this.eventer.on('base.reconnecting', this.onReconnecting, this);
        this.eventer.on('base.reconnected', this.onReconnected, this);
        this.eventer.on('base.loginServerSuccess', this.onLoginServerSuccess, this);
    },

    /**
     * 初始化连接
     */
    initConnector: function(){
        var self = this;         
        var onConnected = function(){  
            var onAuthorizeSuccess = function(){
                lx.login({
                    success: function(res) {
                        // lx.log("登录",res); 
                        self._setUserInfo({pstring: res.pstring, pkey: res.pkey});
                        self.connect();
                    },
                    fail: function(res) {
                        var title = "提示",
                        content = res.message, 
                        confirmText = '重新登录',
                        onConfirm = function(){
                            onConnected(); 
                        };
                        self.dialog.showAlert('base.initconn', title, content, confirmText, onConfirm); 
                    }
                });
            };
            var params = {
                scope: "scope.userInfo",
                before: function(){
                    lx.log("before");
                },
                after: function(){
                    lx.log("after");
                },
                fail: function(){
                    //强制授权登陆成功
                    lx.authorize(params);
                },
                success: onAuthorizeSuccess,
            };
            lx.authorize(params);
        }
        this.connector.init(onConnected);
    },

    /**
     * 初始化其他模块
     */
    initExtraModule: function() {
        var lx = window.lx ? window.lx : (window.lx = {}, window.lx);
        var module = lx.module = {};

        var golds = require("lx.module.golds");
        golds.init(this.node);
        lx.module.golds = golds;
    },

    /**
     * 连接服务器
     */
    connect: function () {
        this.scheduleOnce(function () {
            this.connector.connect({gameid: this.userinfo.gameid, account: this.userinfo.pstring, password: this.userinfo.pkey});
        }, 0);
    },

    /**
     * 连接成功
     */
    onConnected: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.dialog.hideTips();
        this.eventer.emit("lx.game.connected", null);
    },

    /**
     * 连接错误
     */
    onConnectError: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var title = '提示';
        var content = '';
        if (data && typeof data.msg == 'string')
            content += data.msg;
        var confirmText = '重新链接';
        var onConfirm = function () {
            this.connect();
        }.bind(this);
        this.dialog.showAlert('base.connectError', title, content, confirmText, onConfirm);
    },

    /**
     * 断开连接
     */
    onDisconnected: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.dialog.hideTips();
        this.onConnectError(evt);
        this.eventer.emit("lx.game.disconnected", null);
    },

    /**
     * 重连
     */
    onReconnecting: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.dialog.showTips('reconnect', '正在为您重新连接服务器......(' + data.count + '/' + data.maxCount + ')');
    },

    /**
     * 重连成功
     */
    onReconnected: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
    },

    /**
     * 设置场景id
     */
    onSceneid: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this._setUserInfo(data);
    },

    /**
     * 准备完成
     */
    onLoginServerSuccess: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this._setUserInfo(data);
        this.eventer.emit("lx.game.ready");
    },
});

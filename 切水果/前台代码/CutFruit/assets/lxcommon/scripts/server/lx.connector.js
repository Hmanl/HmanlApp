
var butils = require("lx.utils");
var eventer = require("lx.eventer");
var lxLoginMessager = require("lx.loginMessager");
var ccGameMessager = require("cf.gameMessager");

var LOGIN_URL = 'ws://h6s.lexun.com:8400';  
var DEFAULT_CHANNEL = 0;
var SCENE_IDS = [1,2,3,4];

var WATING = 0;
var DETECTING = 1;
var CONNECTING = 2;
var CONNECTED = 3;
var RECONNECTING = 4;
var DISCONNECTING = 5;

cc.Class({
    extends: cc.Component,

    statics: {
        WATING: WATING,
        DETECTING: DETECTING,
        CONNECTING: CONNECTING,
        CONNECTED: CONNECTED,
        RECONNECTING: RECONNECTING,
        DISCONNECTING: DISCONNECTING,
    },

    /**
     * 属性
     */
    properties:{
        eventer: eventer
    },

    /**
     * 初始化
     */
    init: function(callback){
        this.status = WATING;
        this.maxReconnectCount = 5;
        this.messagers = {};
        var total = 2;
        var handle = function (callback, target) {
            return function (evt) {
                try {
                    callback && callback.call(target, evt);
                } catch (error) {
                    this.onConnectError({msg: error.message});
                }
            };
        };
        var done = function () {
            if (--total <= 0) {
                this.on('base.beat', handle(this.onBeat, this), this);
                this.on('base.loginSuccess', handle(this.onLoginSuccess, this), this);
                this.on('base.loginFailure', handle(this.onLoginFailure, this), this);
                this.on('base.loginServerFailure', handle(this.onLoginServerFailure, this), this);
                this.on('base.offline', handle(this.onUserOffline, this), this);
                callback && callback();
            }
        }.bind(this);

        //登陆消息
        lxLoginMessager.init(function () {
            this.addMessager(lxLoginMessager);
            done();
        }.bind(this));

        //游戏消息
        ccGameMessager.init(function () {
            this.addMessager(ccGameMessager);
            done();
        }.bind(this)); 
    },

    addMessager: function (Messager) {
        var messager = this.messagers[cc.js.getClassName(Messager)] = new Messager();
        messager.connector = this;
        return messager;
    },

    getMessager: function (Messager) {
        return this.messagers[cc.js.getClassName(Messager)];
    },

    onConnected: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.status = CONNECTED;
        this.emit('base.connected', data);
    },

    onConnectError: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.emit('base.connectError', data);
        this.disconnect();
    },

    onUserOffline: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.disconnect({msg: data.msg || "你已退出当前游戏!" });
    },

    onDisconnected: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.status = WATING;
        this.emit('base.disconnected', data);
    },

    onLoginSuccess: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.userInfo = data.userInfo;
        this.servers = data.servers;
        this.onServerDetail();
    },

    onLoginFailure: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onConnectError(data);
    },

    onServerDetail: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var server;
        if (!data || (server = data.serve,!server)) {
            var servers = this.servers;
            if (servers) {
                var connectCount = this.connectCount || 0;
                if (connectCount >= servers.length)
                    connectCount = 0;
                server = servers[connectCount];
                this.connectCount = connectCount + 1;
            }
        }
        if (!server) {
            this.onConnectError({msg: '找不到可连接的服务器'});
            return;
        }
        if (this.status != RECONNECTING) {
            this.status = CONNECTING;
            this.reconnectCount = 0;
        }
        var onOpen = function (evt) {
            this.onConnected({userInfo: this.userInfo});
            this.send('base.loginServer', {userInfo: this.userInfo, accountInfo: this.accountInfo});
            this.sendBeatTime = this.lastBeatTime = null;
            this.schedule(this.beat, 1)
        }.bind(this);
        var onClose = function (evt) {
            this.unschedule(this.beat);
            this.reconnect();
        }.bind(this);
        this.openSocket(server.url, onOpen, onClose);
    },

    onLoginServerFailure: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onConnectError(data);
    },

    onBeat: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.lastBeatTime = new Date().getTime();
        // console.log(this.lastBeatTime - this.sendBeatTime);
    },

    beat: function () {
        var currTime = new Date().getTime();
        var lastBeatTime = this.lastBeatTime || currTime;
        var sendBeatTime = this.sendBeatTime || currTime; 
        if (currTime - lastBeatTime > 5 * 1000 || currTime - sendBeatTime > 5 * 1000) {
            this.interrupt();
            this.sendBeatTime = undefined;
            return;
        }
        this.send('base.beat');
        this.sendBeatTime = currTime;
    },

    connect: function(accountInfo) {
        if (this.status != WATING)
            return false;
        this.status = DETECTING;
        var onOpen = function (evt) {
            this.accountInfo = accountInfo;
            this.send('base.login', {accountInfo: accountInfo});
        }.bind(this);
        var onClose = function (evt) {
            if (this.status == DETECTING)
                this.onConnectError({msg: '连接服务器失败'});
        }.bind(this);
        this.openSocket(LOGIN_URL, onOpen, onClose);
        return true;
    },

    reconnect: function () {
        if (this.status != CONNECTED && this.status != RECONNECTING)
            return;
        if (this.status != RECONNECTING) {
            this.status = RECONNECTING;
            this.reconnectCount = 0;
        }
        if (++this.reconnectCount > (this.maxReconnectCount || 0)) {
            this.onConnectError({msg: '与服务器连接中断'});
            return;
        }
        this.scheduleOnce(function () {
            this.emit('base.reconnecting', {count: this.reconnectCount, maxCount: this.maxReconnectCount});
            var server = {url: this.socket.url};
            this.onServerDetail({server: server});
        }.bind(this), 1)
    },

    disconnect: function (data) {
        if (this.status == DISCONNECTING || this.status == WATING) 
            return false;
        this.status = DISCONNECTING;
        this.closeSocket(function () {
            this.onDisconnected(data);
        }.bind(this));
        return true;
    },

    interrupt: function (callback) {
        if (this.status != CONNECTED || this.socket.readyState != WebSocket.OPEN)
            return false;
        this.closeSocket(callback);
        return true;
    },

    openSocket: function (url, onOpen, onClose, onError) {
        this.closeSocket(function () {
            try {
                var socket = this.socket = new WebSocket(url);
                socket.binaryType = 'arraybuffer';
                socket.onopen = function(evt) {
                    onOpen && onOpen(evt);
                }.bind(this); 
                socket.onmessage = function(evt) {
                    this.recvMsg(evt.data);
                }.bind(this); 
                socket.onclose = function(evt) { 
                    onClose && onClose(evt);
                }.bind(this); 
                socket.onerror = function(evt) { 
                    onError && onError(evt);
                }.bind(this); 
            } catch (error) {
                this.onConnectError({msg: '请检查您的浏览器是否支持WebSocket'});
            }
        }.bind(this));
    },

    closeSocket: function (callback) {
        var socket = this.socket;
        if (socket && socket.readyState != WebSocket.CLOSED) {
            if (callback) {
                var onClose = typeof socket.onclose == 'function' ? socket.onclose : null;
                socket.onclose = function () {
                    onClose && onClose();
                    callback();
                };
            }
            socket.close();
        } else {
            callback && callback();
        }
    },

    sendMsg: function (mainCmd, subCmd, body) {
        var buffer = new ArrayBuffer(10 + (!!body ? body.byteLength : 0));
        var msgHead = new Uint8Array(buffer, 0, 2);//消息头部
        var msgCmd = new Uint16Array(buffer, 2, 4);// 消息命令部分
        var msgBody = new Uint8Array(buffer, 10);
        msgHead.set([6, 0]);
        msgCmd.set([buffer.byteLength, 0, mainCmd, subCmd]);
        if (msgBody.length > 0) {
            msgBody.set(new Uint8Array(body));
        }
        if (this.socket.readyState != WebSocket.OPEN) { 
            throw({message: '与服务器连接中断'});
        }
        
        // mainCmd != 0 && console.log('sendMsg', mainCmd, subCmd, body);
        this.socket.send(buffer);
    },

    recvMsg: function (buffer) {
        try {
            if (!buffer instanceof ArrayBuffer)
                return;
            var msgHead = new Uint8Array(buffer, 0, 2);//消息头部
            var msgCmd = new Uint16Array(buffer, 2, 4);// 消息命令部分
            var msgBody = new Uint8Array(buffer, 10);
            if (msgHead[0] != 6)
                throw({message: '包头错误'});
            else if(buffer.byteLength != msgCmd[0])
                throw({message: '包长错误'});

            var mainCmd = msgCmd[2];
            var subCmd = msgCmd[3]
            var body = new Uint8Array(msgBody).buffer;
            
            // mainCmd != 0 && console.log('recvMsg', mainCmd, subCmd, body);
            this.parseMsg(mainCmd, subCmd, body);
        } catch (error) {
            if (this.status != CONNECTED)
                this.onConnectError({msg: error.message});
            else
                throw(error);
        }
    },

    parseMsg: function (mainCmd, subCmd, body) {
        var messagers = this.messagers;
        for (var p in messagers) {
            if (!messagers.hasOwnProperty(p))
                continue;
            messagers[p].parseMsg(mainCmd, subCmd, body);
        }
    },

    send: function (type, data) {
        try {
            var messagers = this.messagers;
            for (var p in messagers) {
                if (!messagers.hasOwnProperty(p))
                    continue;
                messagers[p].send(type, data);
            }
        } catch (error) {
            if (this.status != CONNECTED && this.status != RECONNECTING) 
                this.onConnectError({msg: error.message});
        }
    },

    emit: function(messages, detail){
        this.eventer.emit(messages, detail);
    },

    on: function(eventers, callback, target, useCapture){
        this.eventer.on(eventers, callback, target, useCapture)
    }
});

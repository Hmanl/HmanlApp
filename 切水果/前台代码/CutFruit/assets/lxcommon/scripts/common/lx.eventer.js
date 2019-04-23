var lxUtils = require("lx.utils")

cc.Class({
    extends: cc.Component,

    /**
     * 属性
     */
    properties:{
        //是否可用
        paused: false
    },

    /**
     * 初始化
     */
    onLoad: function(){
        this.enabled = true;
    },

    /**
     * 注册事件
     */
    on: function (eventers, callback, target, useCapture) {
        var on = function(){
            eventers.split(",").forEach(function(type) {
                type = type.trim();
                type && this.node.on(type, callback, target, useCapture);
            }, this);
        }.bind(this);
        lxUtils.isString(eventers) && callback && on();
    },

    /**
     * 取消事件
     */
    off: function (eventers, callback, target, useCapture) {
        var off = function(){
            eventers.split(",").forEach(function(type) {
                type = type.trim();
                this.node.off(type, callback, target, useCapture);
            }, this);
        }.bind(this);
        lxUtils.isString(eventers) && callback && off();
    },

    /**
     * 发送事件
     */
    emit: function (messages, detail) {
        var emit = function(){
             messages.split(",").forEach(function(message) {
                 message = message.trim();
                 message && this.node.emit(message, detail);
            }, this);
        }.bind(this);
        
        //处于可用状态分发事件
        !this.paused && lxUtils.isString(messages) && emit();
    },

    /**
     * 清除对象事件
     */
    targetOff: function (target) {
        this.node.targetOff(target);
    }
});
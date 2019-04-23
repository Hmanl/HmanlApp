var lxComp = require("lx.comp");
var _inited,
    _audior,
    _dialog,
    nView,
    empty = function(){};

var ckComp = cc.Class({
    extends: lxComp,

    /**
     * 属性
     */
    properties: {
        /**
         * 音频
         */
        audior: {
            type: empty,
            get: function(){
                return _audior;
            },
            override: true,
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
            override: true,
            visible: false,
        },
    },

    /**
     * 初始化
     */
    init: function(data){
        if(_inited) return;
        _inited = true;

        var mNode = cc.instantiate(data.module);
        cc.game.addPersistRootNode(mNode); 
        _dialog = mNode.getComponent("cf.dialog");
        _audior = mNode.getComponent("cf.audior");
        return true;
    },

    /**
     * 显示
     */
    show: function(ishide){
        this.node.active = true;
    },
    
    /**
     * 隐藏
     */
    hide: function(){
        this.node.active = false;
    },

    /**
     * 显示
     */
    showView: function(){
        this.node.active = true;
    },

    /**
     * 隐藏
     */
    hideView: function(evt, notAudio){
        this.node.active = false;
    },
});
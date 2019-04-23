var cfComp = require("cf.comp");

cc.Class({
    extends: cfComp,

    /**
     * 属性
     */
    properties: {
        /**
         * 模块预制
         */
        module: cc.Prefab,

        /**
         * 视图节点
         */
        viewNode: cc.Node,
    },
    
    /**
     * 加载中
     */
    onLoad: function () {
        if(!this.initView()) return;

        this.initEventer();  
        window.self = this;
    },

    /**
     * 可用
     */
    onEnable: function(){
        cc.game.setFrameRate(30);
        // 关闭左下角FPS
        cc.director.setDisplayStats(false);
    },

    /**
     * 初始化视图
     */
    initView: function(){
        for(var idx in this.node.children){
            var childNode = this.node.children[idx];
            childNode.active = false;
        }
        if(!this.chekInited()) return false;

        this.init({module: this.module});
        for(var idx in this.node.children){
            var childNode = this.node.children[idx];
            childNode.active = true;
        }
        return true;
    },

    /**
     * 初始化事件
     */
    initEventer: function(){
        this.eventer.on("cc.view.action", this.onViewAction, this);
        this.eventer.on("cc.view.show", this.onViewShow, this);
        this.eventer.on("lx.game.disconnected", this.onDisconnected, this);
    },

    /**
     * 断开连接
     */
    onDisconnected: function(){
        this.eventer.emit("cc.game.reset");
    },
    
    /**
     * 获得
     */
    loadSyncView: function(name, onSuccess, onFailure){
        var path = "ckhungry/views/" + name;
        this.addChildByPrefab(this.viewNode, path, onSuccess, onFailure);
    },

    /**
     * 游戏视图
     */
    onViewAction: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(!data || !data.name || !data.callback) return;

        this.loadSyncView(data.name, function(nView){
            nView && data.callback(nView);
        });
    },

    /**
     * 显示视图
     */
    onViewShow: function(evt){
        var name = evt instanceof cc.Event ? evt.detail : evt;
        if(!name) return;
        
        this.loadSyncView(name, function(node){
            node.active = false;
            var ckComp = node.getComponent("cf.comp");
            ckComp.showView();
        }.bind(this));
    },
});

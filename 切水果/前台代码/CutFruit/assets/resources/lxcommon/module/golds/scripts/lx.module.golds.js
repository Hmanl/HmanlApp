var GoldModule = function () {
    this.goldBox = {};
};

GoldModule.prototype = {
    /**
     * 初始化
     */
    init: function(nRoot) {
        cc.loader.loadRes("lxcommon/module/golds/golds_box", function(err, prefab){
            var node = cc.instantiate(prefab);
            node.active = false;
            node.parent = nRoot;
            var goldBox = node.getComponent("lx.goldsbox");
            goldBox.init();
            this.goldBox = goldBox;
        }.bind(this));
    },

    /**
     * 显示
     */
    show: function() {
        this.goldBox.show();
    },

    /**
     * 隐藏
     */
    hide: function() {
        this.goldBox.hide();
    }
}
module.exports = new GoldModule();

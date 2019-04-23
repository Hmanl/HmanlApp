var lxLayout = require("lx.layout");
cc.Class({
    extends: lxLayout,

    /**
     * 初始化
     * 约定此节点的宽和高就是设计分辨率
     */
    onLoad: function (dt) {
        this.__proto__.constructor.$super.prototype.onLoad.call(this, dt);
    },
});

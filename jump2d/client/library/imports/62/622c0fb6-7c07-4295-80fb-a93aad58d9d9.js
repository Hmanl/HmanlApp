"use strict";
cc._RF.push(module, '622c0+2fAdClYD7qTqtWNnZ', 'layout');
// script/layout.js

"use strict";

cc.Class({
    extends: cc.Component,

    /**
     * 属性
     */
    properties: {
        /**
         * 最大比率(宽度缩放)
         */
        maxRate: 1.5
    },

    /**
     * 初始化
     * 约定此节点的宽和高就是设计分辨率
     */
    onLoad: function onLoad() {
        var rate = this.node.width / this.node.height;
        var nCanvas = cc.director.getScene().children[0];

        // console.log('layout节点尺寸',this.node.width,this.node.height);
        // console.log('canvas即屏幕尺寸',nCanvas.width,nCanvas.height);
        if (cc.sys.isMobile) {
            if (nCanvas.width / nCanvas.height > rate) {
                var maxWidth = nCanvas.height * rate * this.maxRate;
                this.node.height = nCanvas.height;
                this.node.width = maxWidth > nCanvas.width ? nCanvas.width : maxWidth;
            } else {
                var zoom = nCanvas.width / this.node.width,
                    maxHeight = this.node.height * this.maxRate,
                    height = nCanvas.height / zoom;
                nCanvas.scale = zoom;
                this.node.height = height > maxHeight ? maxHeight : height;
            }
        } else {
            this.node.height = nCanvas.height;
            this.node.width = nCanvas.height * rate;
        }
    }
});
/////

cc._RF.pop();
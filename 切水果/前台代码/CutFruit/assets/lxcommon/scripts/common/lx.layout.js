cc.Class({
    extends: cc.Component,

    /**
     * 属性
     */
    properties:{
        /**
         * 最大比率(宽度缩放)
         */
        maxRate: 1.2,
    },

    /**
     * 初始化
     * 约定此节点的宽和高就是设计分辨率
     */
    onLoad: function () {
        var rate = this.node.width / this.node.height;
        var nCanvas = cc.director.getScene().children[0];
        if(cc.sys.isMobile){
            if(nCanvas.width / nCanvas.height > rate){
                var zoom = nCanvas.height / this.node.height,
                    maxWidth = this.node.width * this.maxRate,
                    width = nCanvas.width / zoom;
                nCanvas.scale = zoom;
                this.node.width = width > maxWidth ? maxWidth : width;
            }else{
                var zoom = nCanvas.width / this.node.width,
                    maxHeight = this.node.height * this.maxRate,
                    height = nCanvas.height / zoom;
                nCanvas.scale = zoom;
                this.node.height = height > maxHeight ? maxHeight : height;
            }
        }else{
            this.node.height = nCanvas.height;
            this.node.width = nCanvas.height * rate;
        }
    },
});

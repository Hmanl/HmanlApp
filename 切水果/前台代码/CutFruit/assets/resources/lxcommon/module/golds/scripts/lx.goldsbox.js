var lxComp = require("lx.comp");
cc.Class({
    extends: lxComp,

    /**
     * 属性
     */
    properties: {
        goldsBox: cc.EditBox,
        nLxStone: cc.Node,
        nGameScore: cc.Node,
    },

    /**
     * 初始化
     */
    init: function(params) {
        this.eventer.on("lx.golds.detail", this.onGoldsDetail, this);
        this.eventer.on("lx.golds.append", this.onGoldsAppend, this);
        this.eventer.on("lx.golds.fetch", this.onGoldsFetch, this);

        cc.find("stone", this.nLxStone).getComponent(cc.RichText).string = "";
        cc.find("stone", this.nGameScore).getComponent(cc.RichText).string = "";
    },

    /**
     * 显示
     */
    show: function() {
        this.connector.send("lx.golds.detail");
        this.node.active = true;
        this.tmpData = {};
    },

    /**
     * 隐藏
     */
    hide: function () {
        this.node.active = false;
    },

    /**
     * 追加
     */
    append: function() {
        var fGolds = this.tmpData.golds = parseFloat(this.goldsBox.string || this.goldsBox.placeholder);
        var golds = parseInt(Math.round(fGolds * 100000000));
        if(this.tmpData.working){
            this.dialog.showToast("lx.golds.append", "处理中,请稍后...");
            return;
        }
        this.tmpData.working = true;
        this.connector.send("lx.golds.append", {pstring: this.userinfo.pstring, pkey: this.userinfo.pkey, golds: golds});
    },

    /**
     * 取出
     */
    fetch: function(){
        var fGolds = this.tmpData.golds = parseFloat(this.goldsBox.string || this.goldsBox.placeholder);
        var golds = parseInt(Math.round(fGolds * 100000000));
        if(this.tmpData.working){
            this.dialog.showToast("lx.golds.fetch", "处理中,请稍后...");
            return;
        }
        this.tmpData.working = true;
        this.connector.send("lx.golds.fetch", {pstring: this.userinfo.pstring, pkey: this.userinfo.pkey, golds: golds});
    },

    /**
     * 金币详情
     */
    onGoldsDetail: function(evt){
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var formatStone = function(score){
            var score = score.toNumber ? score.toNumber() : score;
            if(score >= 100000000) return "<color=#FF0000>" + (Math.floor(score / 1000000.0) / 100.0) + "</c>亿";
            if(score >= 10000) return "<color=#FF0000>" + (Math.floor(score / 100.0) / 100.0) + "</c>万";
            return "<color=#FF0000>" + score + "</c>";
        };
        cc.find("stone", this.nLxStone).getComponent(cc.RichText).string = formatStone(data.stone); 
        cc.find("stone", this.nGameScore).getComponent(cc.RichText).string = formatStone(data.golds);
    },

    /**
     * 金币操作
     */
    onGoldsAppend: function(evt){
        this.tmpData.working = false;
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(data.issuccess <= 0){
            this.dialog.showToast("lx.golds.append", data.errormsg || "操作失败");
            return;
        }
        this.dialog.showToast("lx.golds.append", "成功存入" + this.tmpData.golds + "亿");
        this.connector.send("lx.golds.detail");
    },

    /**
     * 兑换金币
     */
    onGoldsFetch: function(evt){
        this.tmpData.working = false;
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if(data.issuccess <= 0){
            this.dialog.showToast("lx.golds.fetch", data.errormsg || "操作失败");
            return;
        }
        this.dialog.showToast("lx.golds.fetch", "成功取出" + this.tmpData.golds + "亿");
        this.connector.send("lx.golds.detail");
    },

    /**
     * 取消
     */
    cancel: function () {
        this.hide();
    }, 
});

"use strict";
cc._RF.push(module, '24534PN9mpBFIQ/xoQ0de2F', 'block');
// script/block.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        radius: 0,
        actName: [cc.String]
    },

    start: function start() {
        this.center = cc.p(43, 57);
    },


    jumpResult: function jumpResult(targetPos) {
        var vec = cc.pAdd(this.node.position, this.center);
        var dis = cc.pDistance(vec, targetPos);
        return dis < this.radius ? true : false;
    },

    jumpPerfect: function jumpPerfect(targetPos) {
        var vec = cc.pAdd(this.node.position, this.center);
        var dis = cc.pDistance(vec, targetPos);
        return dis < 15 ? true : false;
    },

    ready: function ready() {
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.animation = this.actName[0];
    },

    jump: function jump() {
        var spine = this.node.children[0].getComponent(sp.Skeleton);
        spine.animation = this.actName[1];
    }

});

cc._RF.pop();
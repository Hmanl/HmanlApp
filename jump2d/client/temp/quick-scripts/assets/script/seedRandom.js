(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/seedRandom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '32412EInCBJEqk2DL6k3YLe', 'seedRandom', __filename);
// script/seedRandom.js

"use strict";

var SeedRandom = function SeedRandom(seed) {
    this.seed = seed || new Date().getTime();
};

SeedRandom.prototype.rand = function () {
    var seed = this.seed = (this.seed * 9301 + 49297) % 233280;
    return parseFloat((seed / 233280.0).toFixed(8));
};

SeedRandom.prototype.randInt = function (min, max) {
    return Math.floor(min + (max - min) * this.rand());
};

module.exports = SeedRandom;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=seedRandom.js.map
        
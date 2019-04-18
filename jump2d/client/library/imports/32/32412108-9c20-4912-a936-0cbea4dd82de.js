"use strict";
cc._RF.push(module, '32412EInCBJEqk2DL6k3YLe', 'seedRandom');
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
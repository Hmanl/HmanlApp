(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/i18n-plugin/LocalizedSprite.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f34ac2GGiVOBbG6XlfvgYP4', 'LocalizedSprite', __filename);
// LocalizedSprite.js

'use strict';

var SpriteFrameSet = require('SpriteFrameSet');

cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true,
        inspector: 'packages://i18n/inspector/localized-sprite.js',
        menu: 'i18n/LocalizedSprite'
    },

    properties: {
        spriteFrameSet: {
            default: [],
            type: SpriteFrameSet
        }
    },

    onLoad: function onLoad() {
        this.fetchRender();
    },
    fetchRender: function fetchRender() {
        var sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite(window.i18n.curLang);
            return;
        }
    },
    getSpriteFrameByLang: function getSpriteFrameByLang(lang) {
        for (var i = 0; i < this.spriteFrameSet.length; ++i) {
            if (this.spriteFrameSet[i].language === lang) {
                return this.spriteFrameSet[i].spriteFrame;
            }
        }
    },
    updateSprite: function updateSprite(language) {
        if (!this.sprite) {
            cc.error('Failed to update localized sprite, sprite component is invalid!');
            return;
        }

        var spriteFrame = this.getSpriteFrameByLang(language);

        if (!spriteFrame && this.spriteFrameSet[0]) {
            spriteFrame = this.spriteFrameSet[0].spriteFrame;
        }

        this.sprite.spriteFrame = spriteFrame;
    }
});

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
        //# sourceMappingURL=LocalizedSprite.js.map
        
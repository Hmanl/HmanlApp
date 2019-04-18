cc.Class({
    extends: cc.Component,
    properties: {
        subPrefab: cc.Prefab
    },
    onLoad () {
        if(typeof(sharedCanvas) != "undefined"){   
            this.tex = new cc.Texture2D();
            this._updateSubDomainCanvas = function() {
                this.tex.initWithElement(sharedCanvas);
                this.tex.handleLoadedTexture();
                this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
            }.bind(this);
        }else{
            var node = cc.instantiate(this.subPrefab);
            node.parent = this.node;
        }
        this.node.active = false;


    },
    update () {
        this._updateSubDomainCanvas && this._updateSubDomainCanvas();
    } 
});

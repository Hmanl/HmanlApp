cc.Class({
    extends: cc.Component,

    start () {
        this.node.setContentSize(cc.winSize);
    },
    
    update () {
        if(this.node.activeInHierarchy){
            // if (!this.tex) {
            //     this.tex = new cc.Texture2D();
            // }
            // this.tex.initWithElement(sharedCanvas);
            // this.tex.handleLoadedTexture();
            // this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);        
        }
    }
});

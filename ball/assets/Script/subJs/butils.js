var Utils = {
    /**
     * 获得图片根据链接
     */
    getImageByUrl: function(url, onSuccess, onError){
        cc.loader.load(url, function (err, texture) {
            if(err){
                onError && onError(err);
            }else{
                onSuccess && onSuccess(texture);
            }
        }.bind(this));    
        return true;
    },

    /**
     * 设置图片根据链接
     */
    createImage: function(sprite, url){
        lx.utils.loadImage({
            url: url,
            success : function(image){
                var texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            },
            fail :function(){
             
            }
        });
    },

    /**
     * 设置图片根据链接
     */
    // setSpriteImage: function(sprite, url){
    //     sprite && url && this.getImageByUrl(url, function(texture){
    //         var spriteFrame = new cc.SpriteFrame();
    //         spriteFrame.setTexture(texture);
    //         sprite.spriteFrame = spriteFrame;
    //     }.bind(this));   
    // },

    /**
     * 排序
     */
    compare: function(prop){
        return function(obj1,obj2){
            if(!obj1 || !obj2){
                return 1;
            } else {
                var val1 = obj1["kvdata"]["value"]["game"][prop];
                var val2 = obj2["kvdata"]["value"]["game"][prop];
                return val2 - val1;
            }
        }
    },
};
module.exports = Utils;
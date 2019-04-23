var lxAudior = require("lx.audior");

cc.Class({
    extends: lxAudior,

    /**
     * 属性 
     */
    properties: {

    },

    /**
     * 播放音乐
     */
    play: function(filePath, loop, volume){
        lxAudior.prototype.play.apply(this, [filePath, loop, volume, "wordguessing"]);
    },

    /**
     * 暂停所有音频
     */
    pauseAll: function(){
        this.audioState["wordguessing"] = true;
        this.pauseByFlag("wordguessing");
    },
    
    /**
     * 恢复所有
     */
    resumeAll: function(){
        this.audioState["wordguessing"] = false;
        this.resumeByFlag("wordguessing");
    },
});
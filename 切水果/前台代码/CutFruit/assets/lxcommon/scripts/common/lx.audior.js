var empty = function(){};

cc.Class({
    extends: cc.Component,

    /**
     * 构造器 
     */
    ctor: function(){
        this.audioData = {};
        this.audioIdx = {};
        this.audioState = {};
    },

    /**
     * 播放音频
     */
    play: function(filePath, loop, volume, flag){
        if(!filePath || (flag && this.audioState[flag])) return;

        var audioId = cc.audioEngine.play(filePath, loop, volume); 
        this.audioIdx[filePath] = audioId;
        if(flag){
            var fData = this.audioData[flag] || {};
            fData[filePath] = audioId;
            this.audioData[flag] = fData;
        }
        return audioId;
    },

    /**
     * 获得音频id
     */
    _getAudioId: function(audioId){
        return typeof(audioId) === "number" ? audioId : this.audioIdx[audioId];
    },

    /** 
     * 设置音量（0.0 ~ 1.0）
     */
    setVolume: function(audioId, volume){
        audioId = this._getAudioId(audioId);
        audioId >= 0 && cc.audioEngine.setVolume(audioId, volume);
    },

    /**
     * 设置音频是否循环
     */
    setLoop: function(audioId,  isloop){
        audioId = this._getAudioId(audioId);
        audioId >= 0 && cc.audioEngine.setLoop(audioId, isloop);
    },

    /**
     * 暂停音频
     */
    pause: function(audioId){
        audioId = this._getAudioId(audioId);
        audioId >= 0 && cc.audioEngine.pause(audioId);
    },

    /**
     * 通过flag停止
     */
    pauseByFlag: function(flag){ 
        if(!flag) return;

        var audioSource = this.audioData[flag];
        if(!audioSource) return;

        for (var idx in audioSource) {
           this.pause(audioSource[idx]);
        }   
    },

    /**
     * 
     * 暂停所有音频
     */
    pauseAll: function(){
        cc.audioEngine.pauseAll();
    },

    /**
     * 恢复播放
     */
    resume: function(audioId){
        audioId = this._getAudioId(audioId);
        return audioId >= 0 && cc.audioEngine.resume(audioId);
    },

    /**
     * 通过flag停止
     */
    resumeByFlag: function(flag){ 
        if(!flag) return;

        var audioSource = this.audioData[flag];
        if(!audioSource) return;

        for (var idx in audioSource) {
           this.resume(audioSource[idx]);
        }  
    },

    /**
     * 恢复所有
     */
    resumeAll: function(){
        cc.audioEngine.resumeAll();
    },

    /**
     * 恢复播放
     */
    stop: function(audioId){
        audioId = this._getAudioId(audioId);
        return audioId >= 0 && cc.audioEngine.stop(audioId);
    },

    /**
     * 通过flag停止
     */
    stopByFlag: function(flag){ 
        if(!flag) return;

        var audioSource = this.audioData[flag];
        if(!audioSource) return;

        for (var idx in audioSource) {
           this.stop(audioSource[idx]);
        }   
    },

    /**
     * 恢复所有
     */
    stopAll: function(){
        cc.audioEngine.stopAll();
    },

    /**
     * 设置一个音频可以设置几个实例
     */
    setMaxAudioInstance: function(nums){
        cc.audioEngine.setMaxAudioInstance(nums);
    },

    /**
     * 设置一个音频结束后的回调
     */
    setFinishCallback: function(audioId, callback){
        audioId = this._getAudioId(audioId);
        setFinishCallback(audioId, callback);
    },
});
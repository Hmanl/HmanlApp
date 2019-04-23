cc.Class({
    extends: cc.Component,
    
    /**
     * 构造器
     */
    ctor: function(){
        this.alertPrefab = null;
        this.tipsPrefab = null;
        this.toastPrefab = null;
        this.confrimPrefab = null;
		this.loadingPrefab = null;
    },

    /**
     * 初始化
     */
    onLoad: function(){
        cc.loader.loadRes("lxcommon/dialog/alert", function(err, prefab){
            this.alertPrefab = prefab;
        }.bind(this));

        cc.loader.loadRes("lxcommon/dialog/tips", function(err, prefab){
            this.tipsPrefab = prefab;
        }.bind(this));

        cc.loader.loadRes("lxcommon/dialog/toast", function(err, prefab){
            this.toastPrefab = prefab;
        }.bind(this));

        cc.loader.loadRes("lxcommon/dialog/confirm", function(err, prefab){
            this.confrimPrefab = prefab;
        }.bind(this));
		
		cc.loader.loadRes("lxcommon/dialog/loading", function(err, prefab){
            this.loadingPrefab = prefab;
        }.bind(this));
    },

    /**
     * 显示alter
     */
    showAlert: function (key, title, content, confirmText, onConfirm) {
        if (!key || !this.alertPrefab)
            return;
        var alerts = this.alerts;
        if (!alerts)
            alerts = this.alerts = {};
        if (alerts[key])
            return;
        var alert = cc.instantiate(this.alertPrefab);
        alert.active = true;
        alert.setLocalZOrder(100);
        var box = alert.getChildByName('box');
        box.getChildByName('title').getComponent(cc.Label).string = title;
        box.getChildByName('content').getComponent(cc.Label).string = content;
        var btnConfirm = box.getChildByName('btnConfirm');
        btnConfirm.getChildByName('label').getComponent(cc.Label).string = typeof confirmText == 'string' ? confirmText : '确认';
        btnConfirm.targetOff(this);
        btnConfirm.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
            this.hideAlert(key);
            onConfirm && onConfirm();
        }, this);
        this.node.addChild(alert);
        alerts[key] = alert;
    },

    /**
     * 隐藏alert
     */
    hideAlert: function (key) {
        var alerts = this.alerts;
        if(!alerts)
            return;

        for (var p in alerts) {
            if (!alerts.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var alert = alerts[p];
                if (!alert)
                    continue;
                alert.destroy();
                alerts[p] = null;
            }
        }
    },

    /**
     * 显示提示框
     */
    showTips: function (key, content) {
        if (!key || !this.tipsPrefab)
            return;
        var tips = this.tips;
        if (!tips)
            tips = this.tips = {};
        if (tips[key])
            return;
        var tip = cc.instantiate(this.tipsPrefab);
        tip.active = true;
        tip.setLocalZOrder(100);
        tip.getChildByName('content').getComponent(cc.Label).string = content;
        this.node.addChild(tip);
        tips[key] = tip;
    },

    /**
     * 更新提示框内容
     */
    updateTips: function(key, content){
        if (!key) return;

        var tip = this.tips && this.tips[key] || null;
        if(!tip) return;
        
        tip.getChildByName('content').getComponent(cc.Label).string = content;
    },

    /**
     * 隐藏提示框
     */
    hideTips: function (key) {
        var tips = this.tips;
        if(!tips)
            return;

        for (var p in tips) {
            if (!tips.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var tip = tips[p];
                if (!tip)
                    continue;
                tip.destroy();
                tips[p] = null;
            }
        }
    },

    /**
     * 显示确认弹框
     */
    showConfirm: function(key, content, confirmText, onConfirm, cancelText, onCancel){
        if (!key || !this.confrimPrefab)
            return;
        var confirms = this.confirms;
        if (!confirms)
            confirms = this.confirms = {};
        if (confirms[key])
            return;
        
        var confirm = cc.instantiate(this.confrimPrefab); 
        cc.find("box/message", confirm).getComponent(cc.Label).string = content;

        var btnConfirm = cc.find("box/bcont/btn_ok", confirm);
        btnConfirm.getChildByName('text').getComponent(cc.Label).string = confirmText || '确认';

        btnConfirm.targetOff(this);
        btnConfirm.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
            if(onConfirm && !onConfirm()) return;
            this.hideConfirm(key);
        }, this);

        var btnCancel = cc.find("box/bcont/btn_cancel", confirm);
        btnCancel.getChildByName('text').getComponent(cc.Label).string = cancelText || '取消';

        btnCancel.targetOff(this);
        btnCancel.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
            this.hideConfirm(key);
            onCancel && onCancel();
        }, this);

        confirm.active = true;
        this.node.addChild(confirm);
        confirms[key] = confirm;
    },

    /**
     * 隐藏确认弹框
     */
    hideConfirm: function(key){
        if(!this.confirms) 
            return;
        var confirms = this.confirms;
        for (var p in confirms) {
            if (!confirms.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var confirm = confirms[p];
                if (!confirm)
                    continue;
                confirm.destroy();
                confirms[p] = null;
            }
        }
    },

    /**
     * 吐司弹窗
     */
    showToast: function(key, content, interval){
        if (!key || !this.toastPrefab)
            return;
        var toasts = this.toasts;
        if (!toasts)
            toasts = this.toasts = {};
        
        var toast = toasts[key];
        if (!toast){
            toast = cc.instantiate(this.toastPrefab);
            toast.active = true;
            toast.opacity = 0;
            this.node.addChild(toast);
            toasts[key] = toast;
        }
        
        cc.find("content/text",toast).getComponent(cc.Label).string = content;
        toast.stopAllActions();
        toast.runAction(cc.sequence(cc.fadeIn(0.25),cc.delayTime(1.5),cc.fadeOut(0.25),cc.callFunc(function(){
            this.hideToast(key);
        }.bind(this))));
    },  
    
    /**
     * 隐藏吐司弹窗
     */
    hideToast: function(key){
        var toasts = this.toasts;
        if(!toasts) 
            return;

        for (var p in toasts) {
            if (!toasts.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var toast = toasts[p];
                if (!toast)
                    continue;
                toast.destroy();
                toasts[p] = null;
            }
        }
    },
	
	/**
     * 显示提示框
     */
    showLoading: function (key) {
        if (!key || !this.loadingPrefab)
            return;
        var loadings = this.loadings;
        if (!loadings)
            loadings = this.loadings = {};
        if (loadings[key])
            return;

        var loading = cc.instantiate(this.loadingPrefab);
        loading.active = true;
        this.node.addChild(loading);
        loadings[key] = loading;
    },

    /**
     * 隐藏提示框
     */
    hideLoading: function (key) {
        var loadings = this.loadings;
        if(!loadings)
            return;

        for (var p in loadings) {
            if (!loadings.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var loading = loadings[p];
                if (!loading)
                    continue;
                loading.destroy();
                loadings[p] = null;
            }
        }
    },
});

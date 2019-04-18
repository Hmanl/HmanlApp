var Sprite = laya.display.Sprite;
var Text = laya.display.Text;
var Bitmap = laya.resource.Bitmap;
var Texture = laya.resource.Texture;
var Handler = laya.utils.Handler;
var Loader = laya.net.Loader;
var Animation = laya.display.Animation;
var Rectangle = laya.maths.Rectangle;
var Event = laya.events.Event;
var Pool = laya.utils.Pool;
var Browser = laya.utils.Browser;
var Stat = laya.utils.Stat;
var SoundManager = laya.media.SoundManager;
var Pool = laya.utils.Pool;
var Point = laya.maths.Point;
var Tween = laya.utils.Tween;
var LocalStorage = laya.net.LocalStorage;  
var SoundManager = laya.media.SoundManager;
var Button  = Laya.Button;
var Gyroscope = laya.device.motion.Gyroscope;
var Accelerator = laya.device.motion.Accelerator;

var Accelerometer = lx.Class({
    ctor: function(){

        wx.startAccelerometer();
        wx.onAccelerometerChange(function(data){
            this.onAccelerometerChange && this.onAccelerometerChange(data);
        }.bind(this));
        wx.stopAccelerometer();
        this.onAccelerometerChange = null;
    },
    startAccelerometer: function(callBack){
        this.onAccelerometerChange = callBack;
        wx.startAccelerometer({"interval" : "game"});
    },
    stopAccelerometer: function(){
        wx.stopAccelerometer();
        this.onAccelerometerChange = null;
    }
});


var Config = {
    
    //游戏宽 高
    GameWidth : 640,
    GameHeight : 1136,

    //游戏速度
    speed : 8,
    //最低速度
    SPEED_SLOW : 8,
    //最高速度
    SPEED_FAST : 12,

    //是否暂停
    isPause : true,
    //是否结束
    isOver : false,

    //是否暂停
    isStart : false,

    //是否领取复活币
    istake : true,

    //陀螺仪开关
    isMove: true,

    //-- 分数
    score : 0, 


    

    /*皮肤商城数据初始化配置
     *@params skin 球皮肤
     *@params coinNums 分数
     * @params btnStatus 按钮状态 (0为未解锁，1为使用中，2为已解锁)
     */ 
    skinList : [
        {"skin":"ball01","coinNums":0,"btnStatus":1,"index":0},
        {"skin":"ball02","coinNums":5000,"btnStatus":0,"index":1},
        {"skin":"ball03","coinNums":10000,"btnStatus":0,"index":2},
        {"skin":"ball04","coinNums":20000,"btnStatus":0,"index":3},
        {"skin":"ball05","coinNums":35000,"btnStatus":0,"index":4},
        {"skin":"ball06","coinNums":50000,"btnStatus":0,"index":5}
    ],

    ballNameCfg : [
        {"name":"美国队长球","flag":1},
        {"name":"黑色8号球","flag":0},
        {"name":"精灵宝贝球","flag":0},
        {"name":"七色彩带球","flag":0},
        {"name":"七色格子球","flag":0},
        {"name":"荧光怪脸球","flag":0}
    ],

    skinBallNow : "ball01",

    /*缩小按钮特效
     *@params target 目标对象
     *@params callBack 回调函数
     * @params thisTag 脚本本身
     */ 
    scaleBtn : function(target,callBack,thisTag){
        var downFlag = true;
        target.on(Laya.Event.MOUSE_DOWN, this, onBtnDown,[target]);
        target.on(Laya.Event.MOUSE_UP, this, onBtnUp,[target,callBack,thisTag]);
        target.on(Laya.Event.MOUSE_MOVE, this, onBtnMove);	
		target.on(Laya.Event.MOUSE_OUT, this, onBtnOut,[target]);
       
        //-- 鼠标按下
        function onBtnDown(target){
            target.scale(0.9,0.9);
            downFlag = false;
        }

        //-- 鼠标抬起
        function onBtnUp(target,callBack,thisTag){         
            target.scale(1,1);
            if(downFlag) return;

            if(callBack){
                callBack(thisTag);
                downFlag = true;
            }

        }

        function onBtnMove(e){
            e.stopPropagation();
        }


        //-- 鼠标移出
        function onBtnOut(target){         
            target.scale(1,1);

        }
    },

    timeOut : function(val,countdown, target){
        if (countdown == 1) {
            target.color = "red" ;
        }else if (countdown == 2) {
            target.color = "yellow" ;
        }else{
            target.color = "white" ;
        }

        if (countdown == 0) {
            countdown = Number(val);  
            target.visible = false;
            return;
        }else{
            target.text="倒计时：" + countdown ;
            countdown--;
        }
        // console.log(this)    
        Laya.timer.once(1000 , target, function(){
            Config.timeOut(val,countdown,target)
        });
    },

    accelerometer: typeof(sharedCanvas) != "undefined" ? new Accelerometer() : null,

    


};













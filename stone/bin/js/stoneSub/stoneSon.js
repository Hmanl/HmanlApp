lx.config.set({"gameid": 600});


(function(){
    //初始化微信小游戏
    Laya.MiniAdpter.init(true,true);
    //程序入口
    Laya.init(640, 1136);
    Laya.stage.alignH = "center";

    Laya.stage.alignV = "middle";

    Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;

    // Laya.URL.basePath = "http://h5.lexun.com/games/wx/ballrun/";

    var res = [
        "res/rank/backBtn.png", 
        "res/rank/icon.jpg", 
        "res/rank/itemBg.png", 
        "res/rank/overPop.png", 
        "res/rank/rankPop.png", 
        "res/rank/the1.png", 
        "res/rank/the2.png", 
        "res/rank/the3.png", 
        "res/rank/title.png"
    ]
    Laya.loader.load(res);

    //-- 缓存数据
    window.rankCach = null;


    //-- 加载子域
    // onLoad();



})();
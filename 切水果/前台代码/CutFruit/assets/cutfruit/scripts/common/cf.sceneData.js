/**************个人信息***************/
var UserInfo = function(){
    this.userid = 1;      //用户id
	this.nick = "";	      //昵称
    this.headimg = "";    //头像
    this.gender = 0;      //性别(0: 未知 1: 男 2: 女)
    this.status = 0;      //用户状态(1: 在线 2: 离开(断线) 4: 退出)
};
UserInfo.prototype = {
    setUserInfo : function(info){
        if(info){
            this.userid = info.userid;     
            this.nick = info.nick;       
            this.headimg = info.headimg;    
            this.gender = info.gender;         
            this.status = info.status;  
        }
    },
};
/**************个人信息***************/

/**************游戏信息***************/
var GambleInfo = function(){
    this.id = 0;                      //比赛id
    this.status = 0;                  //状态(1: 投注中 2: 结算中)
    this.interval = 0;                //时间间隔
    this.wagerids = [];               //投注项目对应id(数组)
    this.wager = [];                  //投注信息
};
GambleInfo.prototype = {
    setGambleInfo : function(info){
        if(info){
            this.id = info.id
            this.status = info.status;
            this.interval = info.interval.toNumber();
            this.setWagerIds(info.wagerids);
            this.setWager(info.wager);
        }
    },

    setWagerIds : function(infos){
        if(infos.length < 1) return;
        this.wagerids = [];        
        for(var idx in infos){
            this.wagerids.push(infos[idx]);
        }
    },

    setWager : function(infos){
        this.wager = [];
        if(infos.length < 1) return;
        for(var idx in infos){
            this.wager.push(infos[idx].toNumber());
        }
    },
};
/**************游戏信息***************/

/**************投注信息***************/
var WagerInfo = function(){
    this.id = 0;                      //投注id
    this.odds = 0;                    //赔率
};
WagerInfo.prototype = {
    setWagerInfo : function(info){
        if(info){
            this.id = info.id;
            this.odds = info.odds;
        }
    },
};
/**************投注信息***************/

/**************用户投注信息***************/
var UserWagerInfo = function(){
    this.wagerid = 0;                    //赌注
    this.betstone = 0;                   //投注
    this.winstone = 0;                   //盈利
};
UserWagerInfo.prototype = {
    setUserWagerInfo : function(info){
        if(info){
            this.wagerid = info.wagerid;
            this.betstone = info.betstone.toNumber();
            this.winstone = info.winstone.toNumber();
        }
    },
};
/**************用户投注信息***************/

/**************用户结算信息***************/
var UserSettleInfo = function(){
    this.userinfo = new UserInfo();       //用户信息
    this.betstone = 0;                    //投注
    this.winstone = 0;                    //盈利
    this.reward = "";                     //其他奖励(json)
    this.wager = [];                      //投注信息
};
UserSettleInfo.prototype = {
    setUserSettleInfo : function(info){
        if(info){
            this.userinfo.setUserInfo(info.userinfo);
            this.betstone = info.betstone.toNumber();
            this.winstone = info.winstone.toNumber();
            this.setWager(info.wager);
        } else {
            this.betstone = 0;
            this.winstone = 0;
            this.wager = [];
        }
    },

    setWager : function(infos){
        this.wager = []; 
        if(infos.length < 1) return;
        var wager = null, info = null;
        for(var idx in infos){
            info = infos[idx];
            wager = new UserWagerInfo();
            wager.setUserWagerInfo(info);
            this.wager.push(wager);
        }
    },
};
/**************用户结算信息***************/

/**************结算信息***************/
var SettleInfo = function(){
    this.gambleid = 0;                  //比赛id
    this.winfos = [];                   //投注信息
    this.uinfo = new UserSettleInfo();  //结算列表（自己）
    this.uinfos = [];                   //结算列表（所有人）
    this.winstone = 0;                  //投注
    this.betstone = 0;                  //盈利
};
SettleInfo.prototype = {
    setSettleInfo : function(info){
        info.gambleid && (this.gambleid = info.gambleid.toNumber());
        info.winfos && (this.setWinfos(info.winfos));
        this.uinfo.setUserSettleInfo(info.uinfo);
        this.setUinfos(info.uinfos);
        this.winstone = info.winstone.toNumber();
        this.betstone = info.betstone.toNumber();
    },

    setWinfos : function(infos){
        if(infos){
            this.winfos = []; 
            var winfo = null, wagerInfo = null;
            infos.sort(function(a, b){
                return b.odds - a.odds;
            });
            for(var idx in infos){
                winfo = infos[idx];
                wagerInfo = new WagerInfo();
                wagerInfo.setWagerInfo(winfo);
                this.winfos.push(wagerInfo);
            }
        }
    },

    setUinfos : function(infos){
        this.uinfos = []; 
        if(infos.length < 1) return;
        var uinfo = null, userSettleInfo = null;
        for(var idx in infos){
            uinfo = infos[idx];
            userSettleInfo = new UserSettleInfo();
            userSettleInfo.setUserSettleInfo(uinfo);
            this.uinfos.push(userSettleInfo);
        }
    },
};
/**************结算信息***************/

/**************用户视图***************/
var UserView = function(){
    this.userinfo = new UserInfo();
    this.playerinfo = {
        roomid : 0,
        wager : [],
        isnewer : false, // 是否新用户
    };
    this.stoneinfo = {
        stone : 0
    };
};
UserView.prototype = {
    setUserView : function(info){
        if(info){
            info.userinfo && (this.userinfo.setUserInfo(info.userinfo));
            info.playerinfo && (this.setPlayerinfo(info.playerinfo));
            this.setUserStone(info.stoneinfo);
        }
    },

    setPlayerinfo : function(info){
        if(info){
            info.roomid && (this.playerinfo.roomid = info.roomid);
            this.playerinfo.isnewer = info.isnewer;
            this.setWager(info.wager);
        }
    },

    setWager : function(infos){
        this.playerinfo.wager = [];
        if(infos.length < 1) return;
        for(var idx in infos){
            this.playerinfo.wager.push(infos[idx]);
        }
    },

    setUserStone : function(info){
        if(!info || !info.stone) return;
        this.stoneinfo.stone = info.stone.toNumber();
    },
};
/**************用户视图***************/

/**************房间信息***************/
var RoomInfo = function(){
    this.id = 0;                        //房间id
    this.owner = new UserInfo();        //拥有者
    this.status = 0;                    //房间状态(1: 空闲中 2: 游戏中)
    this.gambleinfo = new GambleInfo(); //游戏信息
    this.settleinfos = [];              //历史结算信息
};
RoomInfo.prototype = {
    setRoomInfo : function(info){
        if(!info) return;
        info.id && (this.id = info.id);
        info.owner && (this.owner.setUserInfo(info.owner));
        this.status = info.status;
        this.gambleinfo.setGambleInfo(info.gambleinfo);
        this.setSettleinfos(info.settleinfos);
    },

    setSettleinfos : function(infos){
        this.settleinfos = []; 
        if(infos.length < 1) return;            
        var settleInfo = null, info = null;
        for(var idx in infos){
            info = infos[idx];
            settleInfo = new SettleInfo();
            settleInfo.setSettleInfo(info);
            this.settleinfos.push(settleInfo);
        }
    },

    // 保存往期记录
    saveSettleinfo : function(info){
        if(this.settleinfos.length >= 10){
            this.settleinfos.pop();
        }
        var settleInfo = new SettleInfo();
        settleInfo.setSettleInfo(info);
        this.settleinfos.unshift(settleInfo);
        // console.log("保存之后的记录",this.settleinfos);
    },
    
};
/**************房间信息***************/

/**************奖池信息***************/
var JackpotInfo = function(){
    this.stone = 0;                  //奖池信息
};
JackpotInfo.prototype = {
    setJackpotInfo : function(info){
        this.stone = info.stone.toNumber();
    },
};
/**************奖池信息***************/
var SceneInfo = function(){  
    this.userView = new UserView();
    this.roomInfo = new RoomInfo();
    this.jackpotInfo = new JackpotInfo();
    this.settleInfo = new SettleInfo();
};

module.exports = new SceneInfo();
var ProtoBuf = require('protobuf');
var sceneData = require("cf.sceneData");
var butils = require("cf.butils");

var MSG_CMD = {
    /***********************************游戏***********************************/
    //主命令-游戏
    Main_CMD_Game : 18001,

    //子命令-进入房间
    Sub_CMD_C_Match_User_EnterRoom : 1001,
    Sub_CMD_S_Match_User_EnterRoom : 1,
    //子命令-退出房间
    Sub_CMD_C_Match_User_QuitRoom : 1002,
    Sub_CMD_S_Match_User_QuitRoom : 2,
    //子命令-玩家投注
    Sub_CMD_C_Gamble_User_Bet : 1003,
    Sub_CMD_S_Gamble_User_Bet : 3,
    // 子命令-新手奖励
    Sub_CMD_C_Gamble_NewerReward : 1004,
    Sub_CMD_S_Gamble_NewerReward : 4,

    //子命令-推送消息
    Sub_CMD_P_Game_OfflineMsg : 101,
    //子命令-场景信息
    Sub_CMD_P_Game_Scene_View : 102,
    //子命令-用户信息
    Sub_CMD_S_Game_User_View : 103,
    //子命令-金币信息
    Sub_CMD_P_User_Stone_Info : 104,
    //子命令-游戏开启
    Sub_CMD_P_Room_Info : 105,
    //子命令-游戏开启
    Sub_CMD_P_Gamble_Open : 106,
    //子命令-推断结果
    Sub_CMD_P_Gamble_Bet : 107,
    //子命令-推断结果
    Sub_CMD_P_Gamble_Conclude : 108,
    //子命令-结算奖励
    Sub_CMD_P_Gamble_Settle : 109,
    //子命令-游戏关闭
    Sub_CMD_P_Gamble_Close : 110,
    //子命令-推送投注
    Sub_CMD_P_Gamble_User_Bet : 111,
    //子命令-推送投注(奖池)
    Sub_CMD_P_Gamble_Jackpot_Info : 112,
    /***********************************游戏***********************************/
};

var MSG_PB = {

};

var Class = cc.Class({
    name: "cf.gameMessager",
    
    statics: {
        initialized: false,

        init: function (callback) {
            if (this.initialized) {
                callback && callback();
            };
            var total = 1;
            var done = function () {
                if (--total <=  0) {
                    this.initialized = true;
                    callback && callback();
                }
            }.bind(this);
            cc.loader.loadRes('cutfruit/pb/CutfruitPB', function (err, res){
                var builder = ProtoBuf.protoFromString(res);
                MSG_PB.S_Result_Info = builder.build('S_Result_Info');
                MSG_PB.Pagination_Info = builder.build('Pagination_Info');

                MSG_PB.OfflineMsg_Info = builder.build('OfflineMsg_Info');
                MSG_PB.User_Info = builder.build('User_Info');
                MSG_PB.User_Stone_Info = builder.build('User_Stone_Info');
                MSG_PB.User_Player_Info = builder.build('User_Player_Info');
                MSG_PB.User_View = builder.build('User_View');
                MSG_PB.Room_Info = builder.build('Room_Info');
                MSG_PB.Gamble_Info = builder.build('Gamble_Info');
                MSG_PB.Wager_Info = builder.build('Wager_Info');
                MSG_PB.User_Wager_Info = builder.build('User_Wager_Info');
                MSG_PB.User_Settle_Info = builder.build('User_Settle_Info');
                MSG_PB.Settle_Info = builder.build('Settle_Info');
                MSG_PB.P_Game_OfflineMsg = builder.build('P_Game_OfflineMsg');
                MSG_PB.S_Game_Scene_View = builder.build('S_Game_Scene_View');
                MSG_PB.S_Game_User_View = builder.build('S_Game_User_View');
                MSG_PB.P_User_Stone_Info = builder.build('P_User_Stone_Info');
                MSG_PB.Sub_CMD_P_Room_Info = builder.build('Sub_CMD_P_Room_Info');
                MSG_PB.P_Gamble_Open = builder.build('P_Gamble_Open');
                MSG_PB.P_Gamble_Bet = builder.build('P_Gamble_Bet');
                MSG_PB.P_Gamble_Conclude = builder.build('P_Gamble_Conclude');
                MSG_PB.P_Gamble_Settle = builder.build('P_Gamble_Settle');
                MSG_PB.P_Gamble_User_Bet = builder.build('P_Gamble_User_Bet');
                MSG_PB.C_Gamble_User_EnterRoom = builder.build('C_Gamble_User_EnterRoom');
                MSG_PB.S_Gamble_User_EnterRoom = builder.build('S_Gamble_User_EnterRoom');
                MSG_PB.S_Gamble_User_QuitRoom = builder.build('S_Gamble_User_QuitRoom');
                MSG_PB.C_Gamble_User_Bet = builder.build('C_Gamble_User_Bet');
                MSG_PB.S_Gamble_User_Bet = builder.build('S_Gamble_User_Bet');
                MSG_PB.P_Gamble_Jackpot_Info = builder.build('P_Gamble_Jackpot_Info');
                MSG_PB.S_Gamble_NewerReward = builder.build('S_Gamble_NewerReward');
               
                done();
            }.bind(this));
        },
    },

    ctor: function () {
        this.connector = null;
    },

    parseMsg: function (mainCmd, subCmd, body) {
        switch (mainCmd) {
            //游戏
            case MSG_CMD.Main_CMD_Game: 
                this.parseMainMsg(subCmd, body);
                break;
        }
    },

    //解析游戏数据
    parseMainMsg: function (subCmd, body) {
        switch(subCmd){
            // 101 --- 112 服务器推送信息
            // 场景信息 102
            case MSG_CMD.Sub_CMD_P_Game_Scene_View:  
                var pbData = MSG_PB.S_Game_Scene_View.decode(body);
                // console.log("场景信息102：", pbData);
                sceneData.userView.setUserView(pbData.userview);
                sceneData.roomInfo.setRoomInfo(pbData.roominfo);
                sceneData.jackpotInfo.setJackpotInfo(pbData.jackpotinfo);
                this.emit("cf.game.inited,cf.game.scene.view,cf.game.gamble.jackpot.info", pbData); 
                break; 
            // 用户信息 103
            case MSG_CMD.Sub_CMD_S_Game_User_View:
                var pbData = MSG_PB.S_Game_User_View.decode(body);
                // console.log("用户信息103：", pbData);
                sceneData.userView.setUserView(pbData.userinfo);
                break;
            // 金币信息 104
            case MSG_CMD.Sub_CMD_P_User_Stone_Info:
                var pbData = MSG_PB.P_User_Stone_Info.decode(body);
                // console.log("金币信息104：", pbData);
                // console.log("转化后",pbData.info.stone.toNumber());
                sceneData.userView.setUserStone(pbData.info);
                this.emit("cf.game.user.stone.info", pbData);
                break;
            // 游戏开启 105
            case MSG_CMD.Sub_CMD_P_Room_Info:
                var pbData = MSG_PB.Sub_CMD_P_Room_Info.decode(body);
                // console.log("游戏开启105：", pbData);
                sceneData.roomInfo.setRoomInfo(pbData.info);
                this.emit("cf.game.room.info", pbData);
                break;
            // 推断结果 106
            case MSG_CMD.Sub_CMD_P_Gamble_Open:
                var pbData = MSG_PB.P_Gamble_Open.decode(body);
                // console.log("推断结果106：", pbData);
                // 重置玩家上轮投注信息
                sceneData.userView.setWager(pbData.gambleinfo.wager);
                sceneData.roomInfo.gambleinfo.setGambleInfo(pbData.gambleinfo);
                this.emit("cf.game.update.gamble.info", pbData);
                break;
            // 推断结果 107 (110 手动改变房间状态)
            case MSG_CMD.Sub_CMD_P_Gamble_Bet:
                var pbData = MSG_PB.P_Gamble_Bet.decode(body);
                // console.log("推断结果107：",pbData);
                sceneData.roomInfo.gambleinfo.setGambleInfo(pbData.gambleinfo);
                this.emit("cf.game.update.gamble.info", pbData);
                break;
            // 推断结果 108
            case MSG_CMD.Sub_CMD_P_Gamble_Conclude:
                var pbData = MSG_PB.P_Gamble_Conclude.decode(body);
                console.log("推断结果108：",pbData);
                sceneData.roomInfo.gambleinfo.setGambleInfo(pbData.gambleinfo);
                this.emit("cf.game.update.gamble.info", pbData);
                break;
            // 结算奖励 109
            case MSG_CMD.Sub_CMD_P_Gamble_Settle:
                var pbData = MSG_PB.P_Gamble_Settle.decode(body);
                console.log("结算奖励109：", pbData);
                sceneData.roomInfo.gambleinfo.setGambleInfo(pbData.gambleinfo);
                sceneData.roomInfo.saveSettleinfo(pbData.settleinfo); // 往期记录
                sceneData.settleInfo.setSettleInfo(pbData.settleinfo);
                this.emit("cf.game.update.gamble.info", pbData);
                this.emit("cf.game.update.wangqijilu"); // 更新往期记录
                break;
            // 游戏关闭 110
            case MSG_CMD.Sub_CMD_P_Gamble_Close:
                // console.log("110：",pbData);
                // this.emit("cf.game.gamble.close", pbData);
                break;
            // 推送投注 111 
            case MSG_CMD.Sub_CMD_P_Gamble_User_Bet:
                var pbData = MSG_PB.P_Gamble_User_Bet.decode(body);
                // console.log("推送总投注信息111：", pbData);
                sceneData.roomInfo.gambleinfo.setWager(pbData.wager);
                this.emit("cf.game.update.gamble.user.bet");
                break;
            // 推送投注(奖池) 112
            case MSG_CMD.Sub_CMD_P_Gamble_Jackpot_Info:
                var pbData = MSG_PB.P_Gamble_Jackpot_Info.decode(body);
                // console.log("推送投注(奖池)112：", pbData);
                sceneData.jackpotInfo.setJackpotInfo(pbData.info);
                // this.emit("cf.game.gamble.jackpot.info", pbData);
                break;
            // 进入房间 1
            case MSG_CMD.Sub_CMD_S_Gamble_User_EnterRoom:
                var pbData = MSG_PB.S_Gamble_User_EnterRoom.decode(body);
                // console.log("进入房间1：", pbData);
                // sceneData.userView.setUserView(pbData.userview);
                // sceneData.roomInfo.setRoomInfo(pbData.roominfo);
                // this.emit("cf.game.gamble.settle", pbData);
                break;
            // 退出房间 2
            case MSG_CMD.Sub_CMD_S_Gamble_User_QuitRoom:
                var pbData = MSG_PB.S_Gamble_User_QuitRoom.decode(body);
                // console.log("退出房间2：", pbData);
                // this.emit("cf.game.result.info", pbData);
                break;
            // 玩家投注 3
            case MSG_CMD.Sub_CMD_S_Gamble_User_Bet:
                var pbData = MSG_PB.S_Gamble_User_Bet.decode(body);
                // console.log("玩家投注结果",pbData);
                if(pbData.resultbean.result == 1){
                    sceneData.userView.setWager(pbData.wager);
                    this.emit("cf.game.update.user.bet");
                } 
                this.emit("cf.game.user.bet.result", pbData);
                break;
            // 新手引导奖励
            case MSG_CMD.Sub_CMD_S_Gamble_NewerReward:
                var pbData = MSG_PB.S_Gamble_NewerReward.decode(body);
                this.emit("cf.newer.reward.result", pbData);
            default: break;
        }
    },

    /**
     * 发送消息
     */
    send: function (type, data) {
        if (!type || typeof(type) !== 'string') return;
        var connector = this.connector;
        var subtype = type.substr(0, type.indexOf("."));
        switch(subtype){
            //游戏消息
            default:
                this.sendMainMsg(connector, type, data);
                break;
        }
    },

    //发送游戏消息
    sendMainMsg: function (connector, type, data) {
        switch (type) {
            // 进入房间 1001
            case "cf.enter.room":
                data = data || {};
                var pbData = new MSG_PB.C_Gamble_User_EnterRoom();
                pbData.set("roomid", data.roomid);
                connector.sendMsg(MSG_CMD.Main_CMD_Game, MSG_CMD.Sub_CMD_C_Gamble_User_EnterRoom, pbData.encode().toArrayBuffer());
                break;
            // 退出房间 1002
            case "cf.user.quit.room":
                connector.sendMsg(MSG_CMD.Main_CMD_Game, MSG_CMD.Sub_CMD_C_Gamble_User_QuitRoom, null);
                break;
            // 玩家投注 1003
            case "cf.user.bet":
                data = data || {};
                // console.log("前 发送玩家投注信息1003：",data);
                var pbData = new MSG_PB.C_Gamble_User_Bet();
                pbData.set("wagerid", data.wagerid);
                pbData.set("stone", data.stone);
                connector.sendMsg(MSG_CMD.Main_CMD_Game, MSG_CMD.Sub_CMD_C_Gamble_User_Bet, pbData.encode().toArrayBuffer());
                // console.log("后 发送玩家投注 1003",data);
                break;
            // 新手引导奖励
            case "cf.newer.reward":
                connector.sendMsg(MSG_CMD.Main_CMD_Game, MSG_CMD.Sub_CMD_C_Gamble_NewerReward, null);
                break;
            default: break;
        }
    },

    //提交事件
    emit: function (message, detail) {
        this.connector.emit(message, detail);
    },
});

module.exports = Class;
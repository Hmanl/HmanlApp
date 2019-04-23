var ProtoBuf = require('protobuf');

var MSG_CMD = {
    //***********************************登录服务器**************************************//
    //心跳包
    Main_CMD_Game_Beat : 0,
    
    //[主命令]-登陆服务器
    Main_CMD_Login_Server : 11,

    //子命令--登录服务器(客户端发送)
    Sub_CMD_C_Login_Login : 1001,

    //子命令-登录服务器(服务器返回)
    Sub_CMD_S_Login_Login : 1,

    //子命令-登陆游戏服务器(客户端发送)
    Sub_CMD_C_Login_Game : 1002,

    //子命令-登陆游戏服务器(服务器返回)
    Sub_CMD_S_Login_Game : 2,

    //子命令-断开Socket(服务器推送)
    Sub_CMD_S_Game_Offline : 101,

    //子命令-踢出用户(服务器推送)
    Sub_CMD_S_Game_Kicked : 102,

    //子命令-用户请求退出(服务器推送)
    Sub_CMD_S_Game_ReqQuit : 103,
    //***********************************登录服务器**************************************//

    //***********************************场景服务器**************************************//
    //[主命令]-游戏服务器(此处约定登陆游戏服务器主命令为游戏id乘以10(SceneId.CKHungry * 10))
    Main_CMD_Game_Server : 0,

    //子命令-用户进入(客户端发送)
    Sub_CMD_C_User_Enter : 1001,

    //子命令-用户进入(服务器返回)
    Sub_CMD_S_User_Enter : 1,

    //子命令-用户退出(客户端发送)
    Sub_CMD_C_User_Quit : 1002,

    //子命令-用户退出(服务器返回)
    Sub_CMD_S_User_Quit : 2,

    //子命令-追加金币(客户端发送)
    Sub_CMD_C_Golds_Detail : 1003,

    //子命令-追加金币(服务器返回)
    Sub_CMD_S_Golds_Detail : 3,

    //子命令-追加金币(客户端发送)
    Sub_CMD_C_Golds_Append : 1004,

    //子命令-追加金币(服务器返回)
    Sub_CMD_S_Golds_Append : 4,

    //子命令-取出金币(客户端发送)
    Sub_CMD_C_Golds_Fetch : 1005,

    //子命令-取出金币(服务器返回)
    Sub_CMD_S_Golds_Fetch : 5,
    //***********************************游戏服务器**************************************//
};

var MSG_PB = {

};

var Class = cc.Class({
    name: "lx.loginMessager",

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
            cc.loader.loadRes('lxcommon/pb/LoginServerPB', function (err, res){
                var builder = ProtoBuf.protoFromString(res);
                //登陆服务器
                MSG_PB.S_Result_Msg = builder.build('S_Result_Msg');
                MSG_PB.C_Login_Server_Msg = builder.build('C_Login_Server_Msg');
                MSG_PB.S_Login_ServerBean_Msg = builder.build('S_Login_ServerBean_Msg');
                MSG_PB.S_Login_ServerList_Msg = builder.build('S_Login_ServerList_Msg');
                MSG_PB.C_Login_GameServer_Msg = builder.build('C_Login_GameServer_Msg');
                MSG_PB.User_Info = builder.build('User_Info');
                MSG_PB.S_Login_GameServer_Msg = builder.build('S_Login_GameServer_Msg');
                MSG_PB.S_User_Kicked_Msg = builder.build('S_User_Kicked_Msg');
                //游戏服务器
                MSG_PB.C_User_Enter_Msg = builder.build('C_User_Enter_Msg');
                MSG_PB.C_User_Quit_Msg = builder.build('C_User_Quit_Msg');
                MSG_PB.S_Golds_Detail_Msg = builder.build('S_Golds_Detail_Msg');                
                MSG_PB.C_Golds_Action_Msg = builder.build('C_Golds_Action_Msg');
                done();
            }.bind(this));
        },
    },

    ctor: function () {
        this.connector = null;
    },

    parseMsg: function (mainCmd, subCmd, body) {
        switch (mainCmd) {
            case MSG_CMD.Main_CMD_Login_Server: 
                this.parseLoginMsg(subCmd, body);
                break;
            case MSG_CMD.Main_CMD_Game_Beat:
                subCmd === 1 && this.emit('base.beat');   
                break;
            default:
                if(mainCmd <= 0 || mainCmd % 10 !== 0) break;

                this.parseGameMsg(subCmd, body);
                break;
        }
    },

    /**
     * 解析登陆信息
     */
    parseLoginMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.Sub_CMD_S_Login_Login: 
                var pbData = MSG_PB.S_Login_ServerList_Msg.decode(body);
                var pbResutInfo = pbData.get('resultbean');
                
                if(pbResutInfo.get('issuccess') != 1){
                    this.emit('base.loginFailure', {code: pbResutInfo.get('errorcode'), msg: pbResutInfo.get('errormsg')});                    
                    return;
                }
                var userid = pbData.get('userid');
                var code = pbData.get('code');
                var pbServers = pbData.get('loginServerList');
                if(!userid || !code || !pbServers){
                    this.emit('base.loginFailure', {code: -1, msg: '参数异常'});                    
                    return;
                }
                var servers  = [];
                for (var i = 0, len = pbServers.length; i < len; i++) {
                    var pbServer = pbServers[i];
                    var ip = pbServer.get('domain');
                    var port = pbServer.get('port');
                    var server = {
                        url: 'ws://' + ip + ':' + port,
                        // url: 'wss://' + ip,
                    };
                    servers.push(server);
                }
                this.emit('base.loginSuccess', {userInfo: {userid: userid, code: code}, servers: servers});
                break;
            case MSG_CMD.Sub_CMD_S_Login_Game: 
                var pbData = MSG_PB.S_Login_GameServer_Msg.decode(body); 
                if(pbData.resultbean.get('issuccess') != 1){
                    this.emit('base.loginServerFailure', {code: pbData.resultbean.get('errorcode'), msg: pbData.resultbean.get('errormsg')});                    
                    return;
                }
                this.emit('base.loginServerSuccess', pbData.userinfo);
                break;
            case MSG_CMD.Sub_CMD_S_Game_Offline: 
                var pbData = MSG_PB.S_User_Kicked_Msg.decode(body); 
                this.emit("base.offline", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_Game_Kicked:
                var pbData = MSG_PB.S_User_Kicked_Msg.decode(body); 
                this.emit("lx.user.kicked", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_Game_ReqQuit:
                var pbData = MSG_PB.S_User_Kicked_Msg.decode(body); 
                pbData.sceneid && (MSG_CMD.Main_CMD_Game_Server = pbData.sceneid * 10);
                this.send("lx.user.quit");
                break;
        }
    },

    /**
     * 解析游戏信息
     */
    parseGameMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.Sub_CMD_S_User_Enter:
                var pbData = MSG_PB.S_Result_Msg.decode(body); 
                this.emit("lx.user.enter", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_User_Quit:
                var pbData = MSG_PB.S_Result_Msg.decode(body); 
                this.emit("lx.user.quit", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_Golds_Detail:
                var pbData = MSG_PB.S_Golds_Detail_Msg.decode(body); 
                this.emit("lx.golds.detail", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_Golds_Append:
                var pbData = MSG_PB.S_Result_Msg.decode(body); 
                this.emit("lx.golds.append", pbData);
                break;
            case MSG_CMD.Sub_CMD_S_Golds_Fetch:
                var pbData = MSG_PB.S_Result_Msg.decode(body); 
                this.emit("lx.golds.fetch", pbData);
                break;
        }
    },

    send: function (type, data) {
        var connector = this.connector;
        var data = data || {};
        switch (type) {
            case 'base.login': 
                var pbData = new MSG_PB.C_Login_Server_Msg();
                pbData.set('userencrypstring', data.accountInfo.account);
                pbData.set('userencryptkey', data.accountInfo.password);
                connector.sendMsg(MSG_CMD.Main_CMD_Login_Server, MSG_CMD.Sub_CMD_C_Login_Login, pbData.encode().toArrayBuffer());
                break;
            case 'base.loginServer':
                var pbData = new MSG_PB.C_Login_GameServer_Msg();
                pbData.set('userid', data.userInfo.userid);
                pbData.set('code', data.userInfo.code);
                pbData.set('gameid', data.accountInfo.gameid || 0);
                connector.sendMsg(MSG_CMD.Main_CMD_Login_Server, MSG_CMD.Sub_CMD_C_Login_Game, pbData.encode().toArrayBuffer());
                break;
            case 'base.beat':
                connector.sendMsg(0, 1);
                break;
            case 'lx.user.enter':
                var pbData = new MSG_PB.C_User_Enter_Msg();
                var sceneid = data.sceneid || 0;
                if(sceneid <= 0) return;

                this.emit("base.sceneid", {sceneid: sceneid});
                MSG_CMD.Main_CMD_Game_Server = sceneid * 10;
                pbData.set('param', data.param || '');
                connector.sendMsg(MSG_CMD.Main_CMD_Game_Server, MSG_CMD.Sub_CMD_C_User_Enter, pbData.encode().toArrayBuffer());
                break;
            case 'lx.user.quit':
                if(MSG_CMD.Main_CMD_Game_Server <= 0) return;

                var pbData = new MSG_PB.C_User_Enter_Msg();
                pbData.set('param', data.param || '');
                connector.sendMsg(MSG_CMD.Main_CMD_Game_Server, MSG_CMD.Sub_CMD_C_User_Quit, pbData.encode().toArrayBuffer());
                break;
            case 'lx.golds.detail':
                if(MSG_CMD.Main_CMD_Game_Server <= 0) return;

                connector.sendMsg(MSG_CMD.Main_CMD_Game_Server, MSG_CMD.Sub_CMD_C_Golds_Detail, null);
                break;
            case 'lx.golds.append':
                if(MSG_CMD.Main_CMD_Game_Server <= 0) return;

                var pbData = new MSG_PB.C_Golds_Action_Msg();
                pbData.set('golds', data.golds || 0);
                pbData.set('param', data.param || '');
                connector.sendMsg(MSG_CMD.Main_CMD_Game_Server, MSG_CMD.Sub_CMD_C_Golds_Append, pbData.encode().toArrayBuffer());
                break;
            case 'lx.golds.fetch':
                if(MSG_CMD.Main_CMD_Game_Server <= 0) return;

                var pbData = new MSG_PB.C_Golds_Action_Msg();
                pbData.set('golds', data.golds || 0);
                pbData.set('param', data.param || '');
                connector.sendMsg(MSG_CMD.Main_CMD_Game_Server, MSG_CMD.Sub_CMD_C_Golds_Fetch, pbData.encode().toArrayBuffer());
                break;
        }
    },

    emit: function (message, detail) {
        this.connector.emit(message, detail);
    },
});

module.exports = Class;
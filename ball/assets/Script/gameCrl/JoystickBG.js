var Common = require('JoystickBar');

cc.Class({
    extends: cc.Component,
 
    properties: {

        _speed: 0, //实际速度
        _speed1: 1, //一段速度
        speed2: 0, //二段速度
        gameCrlType:"",//遥感类型
        skillBg:[cc.Node],//技能类型背景图片


        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },

        _joyCom: {
            default: null,
            displayName: 'joy Node',
        },
        // _playerNode: {
        //     default: null,
        //     displayName: '被操作的目标Node',
        // },
 
        _angle: {
            default: null,
            displayName: '当前触摸的角度',
        },
 
        
        _radian: {
            default: null,
            displayName: '弧度',
        },
 
        camera:cc.Node,
    },
 
 
    onLoad: function () {

        this._initTouchEvent();
   
        //子弹类型的范围
        this.type_distance2=100-this.node.width/2;
        this.type_distance1=30;
    },
 
 
    //对圆圈的触摸监听
    _initTouchEvent: function () {
        var self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveEvent, self);
        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, this._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndEvent, self);
    },
 
    //更新移动目标
    update: function (dt) {
        
    },
 
 
    //计算两点间的距离并返回
    _getDistance: function (pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2));
    },
 
    /*角度/弧度转换
    角度 = 弧度 * 180 / Math.PI
    弧度 = 角度 * Math.PI / 180*/
    //计算弧度并返回
    _getRadian: function (point) {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    },
 
    //计算角度并返回
    _getAngle: function (point) {
        var pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
        return this._angle;
    },
 
    //设置实际速度
    _setSpeed: function (point) {
        //触摸点和遥控杆中心的距离
        var distance = this._getDistance(point, this.node.getPosition());
        //如果半径
        if (distance < this._radius) {
            this._speed = this.speed1;
        } else {
            this._speed = this.speed2;
        }
       
    },
 
    _touchStartEvent: function (event) {
        this.node.parent.opacity=255;
        // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //触摸点与圆圈中心的距离
        var distance = this._getDistance(touchPos, cc.p(0, 0));
        //圆圈半径
        var radius=this.node.width / 2;
        // 记录摇杆位置，给touch move使用
        this._stickPos = touchPos;
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        //手指在圆圈内触摸,控杆跟随触摸点
        if (radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
            return true;
        }
        return false;
    },
 
    _touchMoveEvent: function (event) {
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        var distance = this._getDistance(touchPos, cc.p(0, 0));
        var radius=this.node.width / 2;
        // 由于摇杆的postion是以父节点为锚点，所以定位要加上ring和dot当前的位置(stickX,stickY)
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        if(radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
        }else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = this.node.getPosition().x + Math.cos(this._getRadian(cc.p(posX, posY))) * radius;
            var y = this.node.getPosition().y + Math.sin(this._getRadian(cc.p(posX, posY))) * radius;
            this.dot.setPosition(cc.p(x, y));
        }
        //更新角度
        this._getAngle(cc.p(posX, posY));
        //设置实际速度
        this._setSpeed(cc.p(posX, posY));

        //子弹类型界面渲染
        if(this.type_distance2<distance){//切换武器  
            var angel=this.transformAngel(this._angle);
            this.onRenderType(angel);
        }
    
    },
 
    _touchEndEvent: function () {
        var angel=this.transformAngel(this._angle);//得到角度
        this.onFuncType(angel);
        this.node.parent.opacity=120;
        this.dot.setPosition(this.node.getPosition());
        this._speed = 0;
    },

    //角度转换器
    transformAngel:function(angel){
        if(angel<0){
            angel+=360;
        }
        return angel;
    },

    //子弹类型界面渲染
    onRenderType:function(angel){
       
        if(90<angel&&angel<=162){
            this.onRenderFalse();
            this.skillBg[0].active=true;
        }

        if(18<angel&&angel<90){
            this.onRenderFalse();
            this.skillBg[1].active=true;
        }

        if((angel<=18&&angel>0||360>=angel&&angel>306)){
            this.onRenderFalse();
            this.skillBg[2].active=true;
        }
    
        if(306>=angel&&angel>234){
            this.onRenderFalse();
            this.skillBg[3].active=true;
        }

        if(234>=angel&&angel>162){
            this.onRenderFalse();
            this.skillBg[4].active=true;
        }        
    },

    //子弹类型功能
    onFuncType:function(angel){
        if(90<angel&&angel<=162){//追踪
            skillType.direct=false;
            skillType.tracking=true;
            skillType.rebound=false;
            skillType.laser=false;
            skillType.bubble=false;
        }

        if(18<angel&&angel<90){//直射
            skillType.direct=true;
            skillType.tracking=false;
            skillType.rebound=false;
            skillType.laser=false;
            skillType.bubble=false;
        }

        if((angel<=18&&angel>0||360>=angel&&angel>306)){//泡泡
            skillType.direct=false;
            skillType.tracking=false;
            skillType.rebound=false;
            skillType.laser=false;
            skillType.bubble=true;
        }
    
        if(306>=angel&&angel>234){//激光
            skillType.direct=false;
            skillType.tracking=false;
            skillType.rebound=false;
            skillType.laser=true;
            skillType.bubble=false;
        }

        if(234>=angel&&angel>162){//反弹
            skillType.direct=false;
            skillType.tracking=false;
            skillType.rebound=true;
            skillType.laser=false;
            skillType.bubble=false;
        }        
    },

    //子弹类型背景全部置为false
    onRenderFalse:function(){
        for(var i=0;i<5;i++){
            this.skillBg[i].active=false;
        }
    },

});

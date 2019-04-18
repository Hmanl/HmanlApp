

cc.Class({
    extends: cc.Component,

    properties: {
        canvas:cc.Node,
        player:cc.Node,
        npc:cc.Node,
        blackHole:cc.Node,
        buff:cc.Node,
    },
    
    start () {
        this.rigidBody = this.node.getComponent(cc.RigidBody);               
        this.node.type = 31;
        this.preDir = -7;
        this.lv = 0;
        this.skin = 0;     
        this.speed = 100;
        this.maxHp = 10;
        this.hp = 10;
        this.state = 0;
        this.score = 0;                    
        this.loadText();
        this.play(0,true);
        this.node.getChildByName('trigger').type = 33;
        this.blackHole.type = 60;
        this.blackHole.active = false;        
        this.node.active = false;             
    },   

    update (dt) {
        this.onContinue(dt);
    },

    turnDir(dir){
        if(dir != this.preDir){
            this.preDir = dir;
            var k = Math.ceil(this.score / 5000);
            if(k > 16){
                k = 16;
            }
            this.rigidBody.linearVelocity = cc.v2(200*dir,this.speed + k * 25);          
        }
    },

    onPlay(){        
        switch(this.currClip){ 
            case 1:
            if(this.skin == 3){
                this.buff.getComponent(sp.Skeleton).animation = '004_attack02_buff';                
            }
            break;
            case 2:
            this.lock = true;
            this.skin == 3 ? this.node.getChildByName('ray2').getComponent(sp.Skeleton).animation = '004_attack01_ef': 
            this.node.getChildByName('ray').getComponent(sp.Skeleton).animation = 'attack_ef';
            break;                               
            case 4:
            this.rigidBody.linearVelocity = cc.v2(0,0);
            this.npc.pauseAllActions();
            var se = this.canvas.getChildByName('screenEffect');
            se.opacity = 255;
            se.active = true;
            break;
            case 6:
            this.state = 1;
            this.rigidBody.linearVelocity = cc.v2(0,500);
            this.blackHole.setPosition(320,this.player.y + cc.winSize.height * 2);
            this.blackHole.active = true;
            break;            
            default:
            this.rigidBody.linearVelocity = cc.v2(0,0);
        }        
    },

    onContinue(dt){        
        if(this.time < this.dur){
            this.time += dt;            
            switch(this.currClip){
                case 0:
                this.limit();                
                this.move();
                var k = Math.min(10,Math.ceil(this.score / 3000));                                                     
                if(this.time % (14 - k) < 1 && this.lv > 1 &&this.time > 1){
                    this.skin == 3 ? Math.random() > 0.5 ? this.playAnim(1,false) : this.playAnim(2,false) : this.playAnim(2,false);
                }                                              
                break;
                case 2: 
                this.limit();               
                this.turnDir(0);
                if(this.time >= 1 && this.lock){
                    this.lock = false;                                        
                    this.node.getChildByName('trigger').active = true;
                    this.node.getChildByName('trigger').position = cc.v2(0,0);                                                      
                }
                break;                        
                default:
                this.limit();
            }
            if(this.time >= this.dur)
            this.onFinished();            
        }     
    },

    onFinished(){
        switch(this.currClip){            
            case 4:
            this.npc.resumeAllActions();
            var action = cc.fadeOut(0.5);
            var se = this.canvas.getChildByName('screenEffect');
            se.runAction(action);
            this.preDir = -7;
            this.play(0,true);
            break;            
            case 5:            
            this.playAnim(6,true);
            break;
            case 7:
            var ctr = this.player.getComponent('player');
            ctr.hp >0 ?ctr.selectRevive():ctr.gameOver();            
            break;
            default:            
            this.preDir = -7;
            this.play(0,true);                                 
        }
    },

    //鲨鱼移动
    move(){
        var dis = this.player.x - this.node.x;
        Math.abs(dis) > 30?dis > 0?this.turnDir(1):this.turnDir(-1):this.turnDir(0);       
    }, 
    
    //鲨鱼位置限制
    limit(){
        var dis2 = this.player.y - this.node.y;
        if(Math.abs(dis2) > cc.winSize.height*0.5+250){
            this.node.y = this.player.y - (cc.winSize.height*0.5+250);
            if(dis2 < 0){
                this.node.active = false;
            }          
        }            
    },

    playAnim(i,bool){
        if(i > this.currClip){
            this.play(i,bool);
        }
    },

    play(i,bool){
        if(this.currClip == 4){
            this.npc.resumeAllActions();
            var action = cc.fadeOut(0.5);
            var se = this.canvas.getChildByName('screenEffect');
            se.runAction(action);
        }
        if(this.currClip == 2){            
            this.node.getChildByName('trigger').active = false;
            this.node.getChildByName('ray').getComponent(sp.Skeleton).animation = null;
            this.node.getChildByName('ray2').getComponent(sp.Skeleton).animation = null;
        }
        var spine =  this.node.children[0].getComponent(sp.Skeleton);       
        spine.loop = bool;
        spine.animation = spineName[this.skin][i];
        this.currClip = i;
        this.time = 0;        
        bool?this.dur = 99999:this.dur = duration[i];        
        this.onPlay();            
    },

    
    onBeginContact:function(contact, selfCollider, otherCollider){
        if(otherCollider.node.type == 20){
            var bt = otherCollider.node.bullet;            
            var rig = otherCollider.node.getComponent(cc.RigidBody);
            rig.linearVelocity = cc.v2(0,0);
            var spine = otherCollider.node.children[0].getComponent(sp.Skeleton);
            spine.loop = false;
            spine.animation = bullet[bt];
            this.scheduleOnce(function(){
                var control = this.player.getComponent('player');                        
                control.pjtPool.put(otherCollider.node);
                },0.5);
            var k = Math.ceil(this.score / 10000);
            var para = 0;
            bt == 0 ? para = 1 + k : para = 2 + 2 * k;
            this.injured(para);
        }
    },

    //鲨鱼受伤逻辑
    injured(num){
        cc.log("num ",num);
        var hpNode = this.canvas.getChildByName('hp');
        var bar = hpNode.getComponent(cc.ProgressBar);
        var label = hpNode.getChildByName('label').getComponent(cc.Label); 
        if(this.hp > 0){
            this.hp -= num;    
            var ratio = this.hp / this.maxHp;                   
            bar.progress = ratio;
            label.string=this.hp<=0?"0":Math.ceil(ratio * 100).toString();
            if(!hpNode.activeInHierarchy){
                hpNode.active = true;
                bar.scheduleOnce(function(){hpNode.active = false;},3);
            }            
            if(this.hp <= 0){
                this.playAnim(5,false);                
            }else{
                this.playAnim(3,false);
            }
        }   
    },
   
    loadText(){  
        this.duration = [1,2.5,1.5,3,3,0.8,1,1.7];
        this.bullet = ['bullet01_ef','bullet_iron_ef'];
    },
});

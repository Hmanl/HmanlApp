/**
 * 节点池
 * @param {*} prefab  待实例预制
 * @param {*} lenght  初始化数量
 */
var NodePool = function(prefab, lenght, inited){
    this.nodePool = new cc.NodePool();
    this.nodePrefab = prefab;
    this.maxLength = lenght;
    
    //实例化
    if(inited){
        for (let i = 0; i < lenght; i++){this.put(); }
    }
};

NodePool.prototype = {
    /**
     * 添加空节点
     */
    put: function(){
        var node = cc.instantiate(this.nodePrefab); 
        this.nodePool.put(node); 
    },

    /**
     * 尺寸
     */
    size: function(){
        this.nodePool.size();
    },

    /**
     * 创建
     */
    create: function(){
        return this.nodePool.size() <= 0 && this.put(), this.nodePool.get();
    },

    /**
     * 销毁
     */
    destory: function(node){
        if(!node) return;
        
        if(this.size() > this.maxLength){
            node.removeFromParent();
            node.destory();
        }else{
            this.nodePool.put(node);
        }
    },

    /**
     * 销毁字节点
     */
    destoryAllChild: function(node){
        if(!node) return;
        
        var children = node.children, i = 0;
        for (var count = children.length; count > 0; count--) {
            this.destory(children[0]);
        }
    },

    /**
     * 清理
     */
    clear: function(){
        this.nodePool.clear();
    },
}
module.exports = NodePool;
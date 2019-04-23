function Storage() {
    var localStorage = cc.sys.localStorage;

    /**
    * 测试是否能使用本地缓存
    * @param {} localStroage 
    * @returns {} 
    */
    function testStorage(localStroage) {
        var e = localStroage;
        if (e) {
            var rdValue = "__" + Math.round(1e7 * Math.random());
            try {
                localStroage.setItem(rdValue, rdValue),
                    localStroage.removeItem(rdValue);
            } catch (n) {
                e = false;
            }
        }
        return e;
    }

    /**
    * 一个参数获得值 两个参数设置值
    * @param {} key 
    * @param {} value 
    * @returns {} 
    */
    function val(key, value) {
        return 1 === arguments.length ? get(key) : set(key, value);
    }

    /**
    * 获得值
    * @param {} key 
    * @returns {} 
    */
    function get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return localStorage.getItem(key);
        }
    }

    /**
    * 设置值
    * @param {} key 
    * @param {} value 
    * @returns {} 
    */
    function set(key, value) {
        try {
            cc.sys.localStorage.setItem.setItem(key, JSON.stringify(value));
            return true;
        } catch (i) {
            return false;
        }
    }

    /**
    * 移除值
    * @param {} key 
    * @returns {} 
    */
    function remove(key) {
        
        return localStorage.removeItem(key);
    }

    /**
    * 清除
    * @returns {} 
    */
    function clear() {
        return localStorage.clear();
    }

    return testStorage(localStorage) || (localStorage = stub),
        val.set = set,
        val.get = get,
        val.remove = remove,
        val.clear = clear,
        val;
}

module.exports = Storage;
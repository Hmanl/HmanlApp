function MStorage() {
    var obj = {};

    function getItem(object) {
        return object in obj ? obj[object] : null;
    }

    function setItem(key, value) {
        return obj[key] = value,
            true;
    }

    function removeItem(object) {
        var e = object in obj;
        return e ? delete obj[object] : false;
    }

    function clear() {
        return obj = {},
            true;
    }

    return {
        get: getItem,
        set: setItem,
        remove: removeItem,
        clear: clear
    }
};

module.exports = new MStorage();
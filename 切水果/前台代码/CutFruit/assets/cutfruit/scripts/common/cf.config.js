var Config = function () {

    return {
        multiple : 100000,
        fruitsId : {caoMei: 0,chengZi: 1,ningMeng: 2,pingGuo: 3,taoZi: 4,xiGua: 5,xiangJiao: 6,yingTao: 7},
        // 挂机时选中的水果名字
        hangUpFruits : [],
        // 是否挂机
        isHangUp : false,
    };
}

module.exports = new Config();

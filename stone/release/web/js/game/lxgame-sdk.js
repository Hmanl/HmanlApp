!function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var r={};t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(t){return e[t]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=6)}([function(e,t,r){(function(t){var r=/(%d)|(%s)/,n=/%s/,o={global:"undefined"==typeof window?t:window,isNull:function(e){return void 0===e||null===e},isNumber:function(e){return"number"==typeof e||e instanceof Number},isArray:Array.isArray||function(e){return"[object Array]"===toString.call(e)},isString:function(e){return"string"==typeof e||e instanceof String},isObject:function(e){var t=typeof e;return"function"===t||"object"===t&&!!e},isFunction:function(e){return"function"==typeof e||!1},formatStr:function(){var e=arguments.length;if(0===e)return"";var t=arguments[0];if(1===e)return""+t;if("string"==typeof t&&r.test(t))for(var o=1;o<e;++o){var i=arguments[o],c="number"==typeof i?r:n;c.test(t)?t=t.replace(c,i):t+=" "+i}else for(o=1;o<e;++o)t+=" "+arguments[o];return t},bind:function(e,t){if(!this.isFunction(e))throw new TypeError("Bind must be called on a function");return this.isObject(t)?function(){e.apply(t||self,arguments)}:e},has:function(e,t){return null!=e&&hasOwnProperty.call(e,t)},keys:function(e){if(!this.isObject(e))return[];var t=[];for(var r in e)this.has(e,r)&&t.push(r);return t},values:function(e){for(var t=this.keys(e),r=t.length,n=Array(r),o=0;o<r;o++)n[o]=e[t[o]];return n},set:function(e,t){if(this.isObject(e)&&this.isObject(t))for(var r in t)r in e&&(e[r]=t[r])},cover:function(e,t){if(this.isObject(e)&&this.isObject(t))for(var r in t){var n=e[r],o=t[r];n&&this.isObject(n)&&this.isObject(o)?this.cover(n,o):e[r]=t[r]}}};o.check={notImplemented:function(e){return this.notNull(e,"methodName"),function(){if("production"!==(lx.config||{}).mode){var e=e||"method";throw new Error("NotImplementedException: "+e)}}},notNull:function(e,t){if(!o.isNull(e))return!0;if("production"!==(lx.config||{}).mode)throw t=t||"parameter",new Error("ArgumentNullException: "+t);return!1},isString:function(e,t){if(!o.isString(e))return!0;if("production"!==(lx.config||{}).mode)throw t=t||"parameter",new TypeError(o.formatStr("%s is null string",t));return!1},isNumber:function(e,t){if(!o.isNumber(e))return!0;if("production"!==(lx.config||{}).mode)throw t=t||"parameter",new TypeError(o.formatStr("%s is null number",t));return!1}},o.array={removeAt:function(e,t){e.splice(t,1)},remove:function(e,t){var r=e.indexOf(t);return r>=0&&(this.removeAt(e,r),!0)},removeArray:function(e,t){for(var r=0,n=t.length;r<n;r++)this.remove(e,t[r])},appendObjectsAt:function(e,t,r){return e.splice.apply(e,[r,0].concat(t)),e},indexOf:Array.prototype.indexOf,contains:function(e,t){return e.indexOf(t)>=0},copy:function(e){var t,r=e.length,n=new Array(r);for(t=0;t<r;t+=1)n[t]=e[t];return n}},o.string={join:function(e,t){if(!o.isString(e)||!t)return"";for(var r="",n=o.keys(t),i=0,c=n.length;i<c;i++){var a=t[n[i]];(a=a?a.toString():null)&&(r+=a,i<c-1&&(r+=e))}return r}},lx.js=e.exports=o}).call(this,r(3))},function(e,t,r){var n=r(2),o=r(0),i=function(e,t,r,n,o){return"string"==typeof r&&r.replace(/[\w\.]+/g,function(r){r&&(t=e(t,r,n,o))}),t},c=function(e,t,r,n){if(r){var o=e[t]||(e[t]=[]),i=n.context,c=n.ctx;o.push({callback:r,context:i,ctx:i||c})}return e},a=function(e,t,r,n){var o=e?e[t]:null;if(o)for(var i=-1,c=o.length;++i<c;){var a=o[i];a.callback.apply(a.ctx,n)}return e},s=function(e,t,r,n){if(e){var i=n.context,c=0;if(t||r||i){for(var a=t?[t]:o.check.keys(e);c<a.length;c++){var s=e[t=a[c]];if(!s)break;for(var l=[],u=0;u<s.length;u++){var f=s[u];(r&&r!==f.callback&&r!==f.callback._callback||i&&i!==f.context)&&l.push(f)}l.length?e[t]=l:delete e[t]}return e}}},l=function(e,t,r,n){if(r){var o=function(){s(e,t,r,n),r.apply(this,arguments)};o._callback=r,e=c(e,t,o,n)}return e},u=n({name:"LXEvent",on:function(e,t,r){return o.check.notNull(e,"name")&&o.check.notNull(t,"callback")?(this._i_events=i(c,this._i_events||{},e,t,{context:r,ctx:this}),this):this},once:function(e,t,r){return o.check.notNull(e,"name")&&o.check.notNull(t,"callback")?(this._i_events=i(l,this._i_events||{},e,t,{context:r}),this):this},off:function(e,t,r){return this._i_events?(this._i_events=i(s,this._i_events,e,t,{context:r}),this):this},emit:function(e){if(!this._i_events)return this;for(var t=Math.max(0,arguments.length-1),r=Array(t),n=0;n<t;n++)r[n]=arguments[n+1];return i(a,this._i_events,e,void 0,r),this},targetOff:function(e){return this.off(null,null,e)}});lx.Event=e.exports=u},function(e,t){function r(){}function n(e,t,r){Object.defineProperty(e,t,{configurable:!0,writable:!0,enumerable:!0,value:r})}function o(e,t){for(;e;){var r=Object.getOwnPropertyDescriptor(e,t);if(r)return r;e=Object.getPrototypeOf(e)}return null}function i(e,t,r){for(var n in t)e.hasOwnProperty(n)||r&&!r(n)||Object.defineProperty(e,n,o(t,n))}var c=["name","__ctors__","__props__","arguments","call","apply","caller","length","prototype"];lx.Class=e.exports=function(e){if(lx.js.check.notNull(e,"options")){var t=function(e){var t={ctor:function(){},name:"LXClass",base:r,statics:{},properties:{},mixins:[]};return(e=e||{}).ctor&&(t.ctor=e.ctor,delete e.ctor),e.name&&(t.name=e.name,delete e.name),e.extends&&(t.base=e.extends,delete e.extends),e.statics&&(t.statics=e.statics,delete e.statics),e.properties&&(t.properties=e.properties,delete e.properties),e.mixins&&(t.mixins=e.mixins,delete e.mixins),t}(e),o=function(e,t,r){try{var n="";return n+="return function "+e+"(){\n",n+="base.call(this);\n",n+="ctor.apply(this, arguments);\n",n+="};",Function("base","ctor",n)(t,r)}catch(e){return function(){t.call(this),r.apply(this,arguments)}}}(t.name,t.base,t.ctor),a=function(e){var t=function(){};return t.prototype=e,new t}(t.base.prototype);for(var s in a.constructor=o,o.prototype=a,e)o.prototype[s]=e[s];for(var s in t.base)o[s]=t.base[s];for(var s in t.statics)o[s]=t.statics[s];var l=o.prototype,u=t.properties;for(var f in u)n(l,f,u[f]);var d=t.mixins;if(d){for(var h=d.length-1;h>=0;h--){var p=d[h];i(l,p.prototype),i(o,p,function(e){return p.hasOwnProperty(e)&&c.indexOf(e)<0})}l.constructor=o}return o}}},function(e,t){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(r=window)}e.exports=r},function(e,t){var r=lx.js,n=function(){this._storage={}};n.prototype={getItem:function(e){return r.has(this._storage,e)?this._storage[e]:null},setItem:function(e,t){return this._storage[e]=t,!0},removeItem:function(e){return!!r.has(this._storage,e)&&delete this._storage[e]},clear:function(){return this._storage={},!0}},lx.MemoryStorage=e.exports=n},function(e,t){var r=lx.config,n=lx.js,o={trace:0,debug:1,info:2,warn:3,error:4,none:5},i=function(){var e=r.logLevel;return n.has(o,e)?o[e]:o.none};lx.trace=function(){i()>o.trace||(console.trace||console.log).apply(console,arguments)},lx.debug=function(){i()>o.debug||(console.debug||console.log).apply(console,arguments)},lx.log=lx.info=function(){i()>o.info||(console.info||console.log).apply(console,arguments)},lx.warn=function(){i()>o.warn||(console.warn||console.log).apply(console,arguments)},lx.error=function(){i()>o.error||(console.error||console.log).apply(console,arguments)}},function(e,t,r){e.exports=r(7)},function(e,t,r){r(8);var n=lx.js.global;n.wx=n.wx||{},r(34),r(36),r(39),r(43),e.exports=lx},function(e,t,r){(function(t){var n="undefined"==typeof window?t:window;n.lx=n.lx||{},n._lx=n._lx||{},r(9),r(12),r(14),r(17),r(19),r(25),e.exports=lx}).call(this,r(3))},function(e,t,r){r(10),r(11)},function(e,t,r){var n=r(0),o={gameid:1,version:"0.0.1",platform:"none",mode:"development",logLevel:"info",set:function(e){n.cover(this,e)}};lx.config=e.exports=o},function(e,t,r){var n=r(1),o=r(4),i={event:new n,mstorage:new o};lx.global=e.exports=i},function(e,t,r){r(0),r(2),r(1),r(13)},function(e,t,r){function n(e,t,r){Object.defineProperty(e,t,{configurable:!0,enumerable:!0,get:function(){return this["_i_"+t]},set:function(e){this["_i_"+t]=e,this._i_onchange&&this._i_onchange()}})}var o=r(2),i=r(1),c=function(){this._i_change_invoked||(this._i_change_invoked=setTimeout(function(){this._i_change_invoked=null,this.emit("change",this)}.bind(this),0))};lx.Model=e.exports=function(e){if(lx.js.check.notNull(e,"options")){var t=e.properties;(null==e.mixins&&(e.mixins=[],e.mixins)).push(i);var r=o(e),a=r.prototype;if(Object.defineProperty(a,"_i_onchange",{configurable:!0,enumerable:!0,get:c}),t){a=r.prototype;for(var s in t)n(a,s,t[s])}return r}}},function(e,t,r){r(15),r(16)},function(e,t){var r=lx.js;lx.request=r.check.notImplemented("request")},function(e,t){var r=lx.js;lx.connectSocket=r.check.notImplemented("connectSocket")},function(e,t,r){lx.encoder=e.exports={base64:r(18)}},function(e,t){var r={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t,r,n,o,i,c,a,s="",l=0;for(e=this._utf8_encode(e);l<e.length;)o=(t=e.charCodeAt(l++))>>2,i=(3&t)<<4|(r=e.charCodeAt(l++))>>4,c=(15&r)<<2|(n=e.charCodeAt(l++))>>6,a=63&n,isNaN(r)?c=a=64:isNaN(n)&&(a=64),s=s+this._keyStr.charAt(o)+this._keyStr.charAt(i)+this._keyStr.charAt(c)+this._keyStr.charAt(a);return s},decode:function(e){var t,r,n,o,i,c,a="",s=0;for(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");s<e.length;)t=this._keyStr.indexOf(e.charAt(s++))<<2|(o=this._keyStr.indexOf(e.charAt(s++)))>>4,r=(15&o)<<4|(i=this._keyStr.indexOf(e.charAt(s++)))>>2,n=(3&i)<<6|(c=this._keyStr.indexOf(e.charAt(s++))),a+=String.fromCharCode(t),64!=i&&(a+=String.fromCharCode(r)),64!=c&&(a+=String.fromCharCode(n));return a=this._utf8_decode(a)},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");for(var t="",r=0;r<e.length;r++){var n=e.charCodeAt(r);n<128?t+=String.fromCharCode(n):n>127&&n<2048?(t+=String.fromCharCode(n>>6|192),t+=String.fromCharCode(63&n|128)):(t+=String.fromCharCode(n>>12|224),t+=String.fromCharCode(n>>6&63|128),t+=String.fromCharCode(63&n|128))}return t},_utf8_decode:function(e){for(var t="",r=0,n=0,o=0,i=0;r<e.length;)(n=e.charCodeAt(r))<128?(t+=String.fromCharCode(n),r++):n>191&&n<224?(o=e.charCodeAt(r+1),t+=String.fromCharCode((31&n)<<6|63&o),r+=2):(o=e.charCodeAt(r+1),i=e.charCodeAt(r+2),t+=String.fromCharCode((15&n)<<12|(63&o)<<6|63&i),r+=3);return t},encodeArr:function(e){for(var t,r,n,o,i,c,a,s="",l=0;l<e.length;)o=(t=e[l++])>>2,i=(3&t)<<4|(r=e[l++])>>4,c=(15&r)<<2|(n=e[l++])>>6,a=63&n,isNaN(r)?c=a=64:isNaN(n)&&(a=64),s=s+this._keyStr.charAt(o)+this._keyStr.charAt(i)+this._keyStr.charAt(c)+this._keyStr.charAt(a);return s},decodeArr:function(e){var t,r,n,o,i,c,a=[],s=0;for(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");s<e.length;)t=this._keyStr.indexOf(e.charAt(s++))<<2|(o=this._keyStr.indexOf(e.charAt(s++)))>>4,r=(15&o)<<4|(i=this._keyStr.indexOf(e.charAt(s++)))>>2,n=(3&i)<<6|(c=this._keyStr.indexOf(e.charAt(s++))),a.push(t),64!=i&&a.push(r),64!=c&&a.push(n);return a}};e.exports=r},function(e,t,r){r(20),r(21),r(22),r(23),r(4),r(5),r(24)},function(e,t){var r=lx.js;lx.getStorageSync=r.check.notImplemented("getStorageSync"),lx.setStorageSync=r.check.notImplemented("setStorageSync"),lx.removeStorageSync=r.check.notImplemented("removeStorageSync"),lx.clearStorageSync=r.check.notImplemented("clearStorageSync"),lx.getStorageInfoSync=r.check.notImplemented("getStorageInfoSync")},function(e,t){var r=lx.js,n=/(\.[^\.\/\?\\]*)(\?.*)?$/,o=/(\?|^)?([^?]*)(#|$)/,i=/(\w*\.\w+)+(:\d{1,6})?/;lx.path=e.exports={extname:function(e){var t=n.exec(e);return t?t[1]:""},filename:function(e){if(e){var t=e.lastIndexOf(".");if(-1!==t)return e.substring(0,t)}return e},join:function(){for(var e=arguments.length,t="",r=0;r<e;r++)t=(t+(""===t?"":"/")+arguments[r]).replace(/(\/|\\\\)$/,"");return t},domain:function(e){return i.test(e)?i.exec(e)[0]:""},toQueryString:function(e,t){if(r.isString(e))return e;if(!r.isObject(e))return"";for(var n="",o=r.keys(e),i=o.length,c=0;c<i;c++){var a=o[c];n+=a+"="+(t?encodeURIComponent(e[a]):e[a]),c+1<i&&(n+="&")}return n},toQueryObject:function(e,t){if(r.isObject(e))return e;if(e=this.getQuery(e),!r.isString(e))return{};for(var n={},o=e.split("&"),i=0,c=o.length;i<c;i++){var a=o[i].split("=");a.length<2||(n[a[0]]=t?decodeURIComponent(a[1]):a[1])}return n},addQuery:function(e,t,n){if(e=e?e.trim():"",!(t=r.isString(t)?t:this.toQueryString(t,!n)))return e;if(e.indexOf("?")>=0){var o=e[e.length-1];e+="?"===o||"&"===o?t:"&"+t}else e+="?"+t;return e},getQuery:function(e,t,r){var n="";if(!e)return n;var i=o.exec(e),c=e;if(i&&(c=i[2]),!t)return c;var a=new RegExp("("+t+")=([^&]*)");return a.test(c)?(n=a.exec(c)[2],n=r?n:decodeURIComponent(n)):n}}},function(e,t){var r=lx.js;lx.getCookie=r.check.notImplemented("getCookie"),lx.setCookie=r.check.notImplemented("setCookie"),lx.removeCookie=r.check.notImplemented("removeCookie"),lx.clearCookie=r.check.notImplemented("clearCookie")},function(e,t){var r=function(e){this.seed=e||(new Date).getTime()};r.prototype={rand:function(){return this.seed=(9301*this.seed+49297)%233280,parseFloat((this.seed/233280).toFixed(8))},randInt:function(e,t){return e+Math.floor((t-e)*this.rand())}},lx.SeedRandom=e.exports=r},function(e,t,r){var n=lx.js,o=(r(5),{toInt:function(e,t){t=t||0;try{return e&&!isNaN(e)?parseInt(e):t}catch(e){return t}},toFloat:function(e,t){t=t||0;try{return e&&!isNaN(e)?parseFloat(e):t}catch(e){return t}},round:function(e,t){return this.toFloat((e||0).toFixed(t))},random:function(e,t){return void 0===t&&(t=e,e=0),this.toInt(e+Math.random()*(t-e))},formatStone:function(e){return e=this.toFloat(e),Math.abs(e)>=1e8?Math.floor(e/1e6)/100+"亿":Math.abs(e)>=1e4?Math.floor(e/100)/100+"万":e},formatNumber:function(e,t){return(t=this.toInt(t))<=0||(e+"").length>=t?e:(e=this.toFloat(e),(Math.pow(10,t)+e).toString().substring(1))},toJsonObj:function(e){try{return e&&n.isString(e)?JSON.parse(e):e}catch(t){return e}},toJsonStr:function(e){try{return e?n.isString(e)?e:JSON.stringify(e):""}catch(e){return""}},formaErrorMsg:function(e,t){return{code:e||0,message:t||""}},safeCall:function(e){if(e)try{e.apply(this,Array.prototype.slice.call(arguments,1))}catch(e){lx.error(e)}},safeApply:function(e,t){if(e)try{e.apply(this,t)}catch(e){lx.error(e)}}});lx.utils=e.exports=o},function(e,t,r){r(26),r(27),r(28),r(29),r(30),r(31),r(32),r(33)},function(e,t){var r=lx.js;lx.entry=r.check.notImplemented("entry"),lx.login=r.check.notImplemented("login"),lx.getUserInfoSync=r.check.notImplemented("getUserInfoSync"),lx.getUserInfo=r.check.notImplemented("getUserInfo")},function(e,t){var r=lx.js;lx.shareAppMessage=r.check.notImplemented("shareAppMessage")},function(e,t){var r=lx.js;lx.setUserCloudStorage=r.check.notImplemented("setUserCloudStorage"),lx.getUserCloudStorage=r.check.notImplemented("getUserCloudStorage"),lx.removeUserCloudStorage=r.check.notImplemented("removeUserCloudStorage"),lx.getCloudStorage=r.check.notImplemented("getCloudStorage"),lx.getFriendCloudStorage=r.check.notImplemented("getFriendCloudStorage"),lx.getGroupCloudStorage=r.check.notImplemented("getGroupCloudStorage")},function(e,t){var r=lx.js;lx.authorize=r.check.notImplemented("authorize")},function(e,t){var r=lx.js;lx.postMessage=r.check.notImplemented("postMessage"),lx.onMessage=r.check.notImplemented("onMessage"),lx.getSystemInfoSync=r.check.notImplemented("getSystemInfoSync"),lx.getLaunchOptionsSync=r.check.notImplemented("getLaunchOptionsSync");var n={};lx.require=function(e){return n[e]},lx.export=function(e,t){n[e]=t};var o={};_lx.require=function(e){return o[e]},_lx.export=function(e,t){o[e]=t}},function(e,t){var r=lx.js;lx.showModal=r.check.notImplemented("showModal"),lx.showToast=r.check.notImplemented("showToast"),lx.hideToast=r.check.notImplemented("hideToast")},function(e,t){var r=lx.js;lx.voucherGetBalance=r.check.notImplemented("voucherGetBalance"),lx.voucherRecharge=r.check.notImplemented("voucherRecharge"),lx.voucherPay=r.check.notImplemented("voucherPay")},function(e,t){var r=lx.js;lx.vibrateShort=r.check.notImplemented("vibrateShort"),lx.vibrateLong=r.check.notImplemented("vibrateLong")},function(e,t,r){r(35)},function(e,t){var r=lx.config;r.platform="weixin",r.base_url="http://h5.lexun.com/api_v2/weixin/"},function(e,t,r){r(37),r(38)},function(e,t){var r=lx.js;lx.request=function(e){if(!r.check.notNull(e,"object"))return null;var t=e.url,n=e.header||{},o=e.data||{},i=e.dataType||"json",c=e.method&&"post"==e.method.toLowerCase(),a=e.success,s=e.fail,l=e.complete,u="GET";return o._gameid=lx.config.gameid,o._version=lx.config.version,o._ts=(new Date).getTime(),c&&(u="POST",n["Content-Type"]="application/x-www-form-urlencoded"),n.Cookie=lx.getCookie(null,lx.path.domain(t)),u=c?"POST":"GET",wx.request({url:t,data:o,header:n,method:u,dataType:i,success:function(e){var t=e.header["Set-Cookie"];if(t){for(var r=[],n="";t;)(s=t.indexOf(","))<0?(n+=t,r.push(n),t=null):(n+=t.substr(0,++s)," "!=(t=t.substr(s))[0]&&(r.push(n.substr(0,n.length-1)),n=""));for(var o=(new Date).getTime(),i=r.length-1;i>=0;i--)try{var c=r[i];if(!c)continue;var s,l=(s=(c=c.trim()).indexOf(";"))>0?c.substr(0,c.indexOf(";")):c,u=l.indexOf("=");if(u<=0)continue;var f=l.substr(0,u),d=l.substr(u+1,s),h=null,p=null;if(s>0){var m=/expires=(.*?)(;|$)/;m.test(c)&&(p=(new Date(m.exec(c)[1]).getTime()-o)/864e5);var g=/domain=(.*?)(;|$)/;h=g.test(c)?g.exec(c)[1]:null}lx.setCookie(f,d,p,h)}catch(e){continue}}a&&a(e.data)},fail:s,complete:l})}},function(e,t){var r=lx.js;lx.connectSocket=function(e){if(!r.check.notNull(e,"object"))return null;var t=e.url,n=e.protocols,o=e.success,i=e.fail,c=e.complete;return wx.connectSocket({url:t,method:"CONNECT",protocols:n,success:o,fail:i,complete:c})}},function(e,t,r){r(40),r(41),r(42)},function(e,t){lx.getStorageSync=wx.getStorageSync,lx.setStorageSync=wx.setStorageSync,lx.removeStorageSync=wx.removeStorageSync,lx.clearStorageSync=wx.clearStorageSync,lx.getStorageInfoSync=wx.getStorageInfoSync},function(e,t){var r=lx.js,n=function(){return lx.path.domain(lx.config.base_url)};lx.getCookie=function(e,t){if(!(t=t||n()))return null;var o=(lx.getStorageSync("cookies")||{})[t];if(!o)return null;if(e)return r.has(o,e)?o[e].value:null;var i=r.keys(o),c=(new Date).getTime(),a=[];for(var s in i){var l=o[e=i[s]];!l||l.expires<c?lx.removeCookie(e):a.push(e+"="+l.value)}return r.string.join("; ",a)},lx.setCookie=function(e,t,r,o){if((o=o||n())&&e){r=(new Date).getTime()+(r?864e5*r:36e5);var i=lx.getStorageSync("cookies")||{};(i[o]?i[o]:(i[o]={},i[o]))[e]={value:t,expires:r,domain:o},lx.setStorageSync("cookies",i)}},lx.removeCookie=function(e,t){if((t=t||n())&&e){var r=(lx.getStorageSync("cookies")||{})[t]||{};delete r[e],lx.setStorageSync("cookies",r)}},lx.clearCookie=function(e){if(e=e||n()){var t=lx.getStorageSync("cookies")||{};delete t[e],lx.setStorageSync("cookies",t)}}},function(e,t){var r=lx.utils;r.loadImage=function(e){var t=e.url,n=e.success,o=e.fail,i=e.complete,c=wx.createImage();c.onload=function(){n&&n(c),i&&i()},c.onerror=function(){o&&o(r.formaErrorMsg(3,"loadimg image error")),i&&i()},c.src=t}},function(e,t,r){r(44),r(46),r(47),r(48),r(49),r(50),r(51),r(52),r(54)},function(e,t,r){var n=lx.path,o=lx.js,i=lx.utils,c=lx.config,a=r(45),s=new lx.MemoryStorage;lx.entry=function(e){if(!s.getItem("entered")){s.setItem("entered",1);var t=(e=e||{}).params?i.toJsonStr(e.params):"",r=e.success,a=e.fail,l=e.complete,u={},f=lx.getStorageSync("entered")?1:0;lx.request({url:n.join(c.base_url,"user/entry.aspx"),method:"POST",data:{params:t,entered:f},success:function(e){u=e},fail:function(e){u.errcode=-103,u.errmsg=o.formatStr("调用失败(%s)",e&&e.errmsg||"网络请求失败!")},complete:function(){0!=u.errcode?(s.removeItem("entered"),a&&a(i.formaErrorMsg(u.errcode,u.errmsg))):(lx.setStorageSync("entered",1),r&&r(info)),l&&l()}})}},lx.login=function(e){if(o.check.notNull(e,"object")){var t=e.params?i.toJsonStr(e.params):"",r=e.success,l=e.fail,u=e.complete,f={};wx.login({success:function(e){var d=e.code;wx.getUserInfo({lang:"zh_CN",success:function(e){!function(e,d,h){lx.request({url:n.join(c.base_url,"user/login.aspx"),method:"POST",data:{params:t,code:e,endata:d,iv:h},success:function(e){f=e},fail:function(e){f.errcode=-103,f.errmsg=o.formatStr("登录失败(%s)",e&&e.errmsg||"网络请求失败!")},complete:function(){var e=f.data;if(0!=f.errcode)l&&l(i.formaErrorMsg(f.errcode,f.errmsg));else if(e.user){var t=s.getItem("user")||new a,n=e.user||{},o=e.gameUser||{};n.token=o.token,n.pstring=o.pstring,n.pkey=o.pkey,s.setItem("user",t.set(n)),r&&r(t)}else l&&l(i.formaErrorMsg(-105,"获取用户信息失败"));u&&u()}})}(d,e.encryptedData,e.iv)},fail:function(){l&&l(i.formaErrorMsg(-102,"登录失败(未授权登录)")),u&&u()}})},fail:function(){l&&l(i.formaErrorMsg(-101,"登录失败")),u&&u()}})}},lx.getUserInfoSync=function(){return s.getItem("user")}},function(e,t){var r=lx.js;e.exports=lx.Class({name:"UserInfo",properties:{userid:0,nick:"",headimg:"",gender:2,token:"",pstring:"",pkey:""},ctor:function(e){r.set(this,e)},set:function(e){var t=e||{};return this.userid=t.userid,this.nick=t.nick,this.headimg=t.headimg,this.gender=t.gender,this.token=t.token,this.pstring=t.pstring,this.pkey=t.pkey,this}})},function(e,t){var r=lx.js,n=lx.utils;lx.authorize=function(e){if(r.check.notNull(e,"object")&&e.scope){var t=e.scope,o=e.before,i=e.after,c=e.success,a=e.fail,s=e.complete;wx.getSetting({success:function(e){if(!0===e.authSetting[t])c&&c(),s&&s();else if("scope.userInfo"===t&&wx.createUserInfoButton){var r=wx.getSystemInfoSync(),l=wx.createUserInfoButton({type:"text",text:"",style:{left:0,top:0,width:r.windowWidth,height:r.windowHeight}});l.onTap(function(e){i&&i(),l.hide(),e.userInfo?c&&c():a&&a(n.formaErrorMsg(2,"用户拒绝授权!")),s&&s(),l.destroy()}),o&&o(),l.show()}else o&&o(),wx.authorize({scope:t,success:function(){i&&i(),c&&c(),s&&s()},fail:function(){i&&i(),a&&a(n.formaErrorMsg(2,"用户拒绝授权!")),s&&s()}})},fail:function(){a&&a(n.formaErrorMsg(2,"获取授权信息失败")),s&&s()}})}}},function(e,t){var r=lx.path,n=lx.config,o=lx.utils;lx.addCloudError=function(e,t){(e||t)&&("production"==n.mode?lx.request({url:r.join(n.base_url,"error.aspx"),method:"POST",data:{message:e,stack:t,sysinfo:o.toJsonStr(wx.getSystemInfoSync())}}):lx.error(e,t))},wx.onError&&wx.onError(function(e){lx.addCloudError(e.message,e.stack)})},function(e,t){lx.postMessage=wx.postMessage,lx.getSystemInfoSync=wx.getSystemInfoSync,lx.getLaunchOptionsSync=wx.getLaunchOptionsSync,lx.navigateToMiniProgram=wx.navigateToMiniProgram,lx.createGameClubButton=wx.createGameClubButton},function(e,t){lx.shareAppMessage=wx.shareAppMessage,lx.onShareAppMessage=wx.onShareAppMessage,lx.offShareAppMessage=wx.offShareAppMessage,lx.showShareMenu=wx.showShareMenu,lx.hideShareMenu=wx.hideShareMenu,lx.updateShareMenu=wx.updateShareMenu,lx.getShareInfo=wx.getShareInfo},function(e,t){lx.showModal=wx.showModal,lx.showToast=wx.showToast,lx.hideToast=wx.hideToast,lx.showLoading=wx.showLoading,lx.hideLoading=wx.hideLoading,lx.showActionSheet=wx.showActionSheet},function(e,t){var r=lx.js,n=lx.path,o=lx.config,i=lx.utils;lx.voucherGetBalance=function(e){if(r.check.notNull(e,"object")){var t=e.success,c=e.fail,a=e.complete,s={};lx.request({url:n.join(o.base_url,"voucher/getbalance.aspx"),method:"POST",withCredentials:!0,success:function(e){s=e},fail:function(){s.errcode=-101,s.errmsg=r.formatStr("获取内容失败(%s)",err&&err.errmsg||"网络请求失败")},complete:function(){var e=s.data||{};if(0!=s.errcode)c&&c(i.formaErrorMsg(s.errcode,s.errmsg));else{t&&t({balance:e.balance||0})}a&&a()}})}},lx.voucherRecharge=function(e){if(r.check.notNull(e,"object")){var t=i.toInt(e.amount),c=(e.title,e.remark||""),a=function(){var e=0;switch(((lx.getSystemInfoSync()||{}).platform||"").toLocaleLowerCase()){case"ios":e=1;break;case"android":e=2;break;case"devtools":e=3}return e}();return success=e.success,fail=e.fail,complete=e.complete,result={},1!=a?(fail&&fail(i.formaErrorMsg(-102,"当前平台未开放充值功能!")),void(complete&&complete())):t<=0||t!=e.amount?(fail&&fail(i.formaErrorMsg(-103,"充值金额有误!")),void(complete&&complete())):void lx.request({url:n.join(o.base_url,"voucher/recharge_create.aspx"),method:"POST",data:{amount:t,remark:c,platform:a},withCredentials:!0,success:function(e){result=e||{},0==result.errcode&&(result=e,data=e.data,wx.requestMidasPayment({mode:"game",env:data.env,offerId:data.offerId,currencyType:"CNY",platform:data.platform,buyQuantity:t,zoneId:1,success:function(){lx.request({url:n.join(o.base_url,"voucher/recharge.aspx"),method:"POST",data:{orderid:data.orderid},withCredentials:!0,success:function(e){if(result=e||{},0==result.errcode){var t=e.data||{};success&&success({balance:t.balance,orderid:data.orderid}),complete&&complete()}},fail:function(e){result=e||{}},complete:function(){0!=result.errcode&&(fail&&fail(i.formaErrorMsg(result.errcode||-105,result.errmsg||"充值失败#2")),complete&&complete())}})},fail:function(){fail&&fail(i.formaErrorMsg(-101,"充值失败!")),complete&&complete()}}))},fail:function(e){result=e||{}},complete:function(){0!=result.errcode&&(fail&&fail(i.formaErrorMsg(result.errcode||-104,result.errmsg||"充值失败#1")),complete&&complete())}})}},lx.voucherPay=function(e){if(r.check.notNull(e,"object")){var t=e.orderid,o=e.success,c=e.fail,a=e.complete,s={};if(!t||!r.isString(t))return c&&c(i.formaErrorMsg(-102,"订单号有误!")),void(a&&a());lx.request({url:n.join(lx.config.base_url,"voucher/pay.aspx"),method:"POST",data:{orderid:t},withCredentials:!0,success:function(e){s=e||{}},fail:function(e){s=e||{}},complete:function(){var e=s.data||{};if(0!=s.errcode)c&&c(i.formaErrorMsg(s.errcode,s.errmsg));else{o&&o({balance:e.balance||0,orderid:t,amount:e.amount||0,remark:e.remark||""})}a&&a()}})}}},function(e,t,r){var n=lx.js,o=lx.utils,i=r(53);videoAdInfos={},lx.showRewardedVideoAd=function(e){if(n.check.notNull(e,"object")){var t=e.adUnitId,r=e.fail,c=e.complete;if(!wx.createRewardedVideoAd)return r&&r(o.formaErrorMsg(-102,"当前平台不支持此功能")),void(c&&c());if(!t)return r&&r(o.formaErrorMsg(-103,"参数异常!")),void(c&&c());var a=videoAdInfos[t];a||(a=videoAdInfos[t]=new i(t)),a.show(e)}}},function(e,t){var r=lx.utils,n=lx.Class({name:"RewardedVideoAdInfo",ctor:function(e){this.adUnitId=e,this.options=null;var t=this.videoAd=wx.createRewardedVideoAd&&wx.createRewardedVideoAd({adUnitId:e})||null;t&&(t.onLoad(function(){this.videoAd.show()}.bind(this)),t.onError(function(e){e=e||{};var t=this.options||{},n=t.fail,o=t.complete;this.options=null,n&&n(r.formaErrorMsg(e.errCode||-101,e.errMsg||"fial")),o&&o()}.bind(this)),t.onClose(function(e){e=e||{};var t=this.options||{},r=t.success,n=t.complete;this.options=null,r&&r({isEnded:e.isEnded}),n&&n()}.bind(this)))},show:function(e){var t=(e=e||{}).fail,n=e.complete,o=this.videoAd;return o?this.options?(t&&t(r.formaErrorMsg(-103,"操作失败")),void(n&&n())):(this.options=e,void o.load().catch(function(e){this.options=null,t&&t(r.formaErrorMsg(-101,e&&e.errMsg||"加载失败")),n&&n()})):(t&&t(r.formaErrorMsg(-102,"当前平台不支持此功能")),void(n&&n()))}});e.exports=n},function(e,t){lx.vibrateShort=wx.vibrateShort,lx.vibrateLong=wx.vibrateLong}]);
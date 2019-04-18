require('libs/weapp-adapter/index');
var Parser = require('libs/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('libs/wx-downloader.js');
wxDownloader.REMOTE_SERVER_ROOT = "https://h5.lexun.com/games/wx/panda/test_res";
wxDownloader.SUBCONTEXT_ROOT = "";
require('libs/lxgame-sdk.js');
require('src/settings');
require('main');
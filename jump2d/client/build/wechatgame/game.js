require('libs/weapp-adapter/index');
var Parser = require('libs/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('libs/wx-downloader.js');
wxDownloader.REMOTE_SERVER_ROOT = "https://h5.lexun.com/games/wx/jump2d/1_2_2";
require('libs/lxgame-sdk');
wxDownloader.SUBCONTEXT_ROOT = "";
require('src/settings.3ba52');
require('main.1db37');
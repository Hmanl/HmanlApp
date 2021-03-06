'use strict';

var path = require('path');
var fs = require('fs');

//拷贝文件
function copy(src, dst) {
	fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

//递归拷贝文件
var travel = function(src, dst) {
	try {
		if (!src || !dst) return false;

		if (!fs.existsSync(src)) return false;

		if (!fs.existsSync(dst)) fs.mkdirSync(dst);

		var paths = fs.readdirSync(src);
		for (var i = 0; i < paths.length; i++) {
			try {
				var name = paths[i],
				_src = path.join(src, name),
				_dst = path.join(dst, name);
				if (fs.statSync(_src).isDirectory()) {
					travel(_src, _dst);
					continue;
				}
				copy(_src, _dst);
			} catch(ex) {
				continue;
			}
		}
		return true;
	} catch(ex) {
		return false;
	}
}

//构建完成前事件
function onBeforeBuildFinish(options, callback) {
	var src = "",
		dst = options.dest;
	switch (options.platform) {
		case "web-mobile":
			src = path.join(__dirname, "build-templates/web-mobile");
			break;
		case "web-desktop":
			src = path.join(__dirname, "build-templates/web-desktop");
			break;
		case "fb-instant-games":
			src = path.join(__dirname, "build-templates/fb-instant-games");
			break;
		case "wechatgame":
			src = path.join(__dirname, options.wechatgame.isSubdomain ? "build-templates/wx-sub": "build-templates/wx");
			break;
		case "wechatgame-subcontext":
			src = path.join(__dirname, "build-templates/wx-sub");
			break;
	}

	Editor.log("replace template start");
	travel(src, dst);
	Editor.log("replace template finished");

	callback();
}

module.exports = {
	load() {
		Editor.Builder.on('before-change-files', onBeforeBuildFinish);
	},
	unload() {
		Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
	}
}
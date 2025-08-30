#!/usr/bin/ucode
'use strict';
'require fs';
'require process';
'require uci';

let cfg = uci.load("autoupdate");

// 确保导出对象名称正确
return {
    seturl: {
        args: { url: "string" },
        call: function(args) {
            uci.set("autoupdate", "main", "url", args.url);
            uci.commit("autoupdate");
            return { success: true };
        }
    },
    download: {
        call: function() {
            let url = cfg.main.url;
            if (!url || url == "")
                return { success: false, error: "未配置固件地址" };
                
            console.log("开始下载固件: " + url);
            let code = process.run("/usr/bin/wget", [ "-O", "/tmp/firmware.bin", url ]);
            console.log("下载完成，状态码: " + code);
            return { success: (code == 0) };
        }
    },
    upgrade: {
        call: function() {
            // 异步执行升级
            console.log("开始升级系统");
            process.fork("/sbin/sysupgrade", [ "-c", "/tmp/firmware.bin" ]);
            return { success: true };
        }
    }
};

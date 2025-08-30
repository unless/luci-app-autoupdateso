#!/usr/bin/ucode
'use strict';
'require fs';
'require process';
'require uci';

let cfg = uci.load("autoupdate");

rpc.exports = {
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

            let code = process.run("/usr/bin/wget", [ "-O", "/tmp/firmware.bin", url ]);
            return { success: (code == 0) };
        }
    },
    upgrade: {
        call: function() {
            // 异步执行升级
            process.fork("/sbin/sysupgrade", [ "-c", "/tmp/firmware.bin" ]);
            return { success: true };
        }
    }
};

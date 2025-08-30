#!/bin/sh

echo "===== autoupdate 修复工具 ====="
echo "正在检查并修复 RPC 服务问题..."

# 确保脚本有执行权限
chmod 755 /usr/libexec/rpcd/autoupdate.uc
chmod +x /usr/bin/autoupdate-fix.sh

# 检查RPC服务是否已注册
if ! ubus list | grep -q autoupdate; then
    echo "RPC 服务未注册，尝试修复..."
    
    # 重启rpcd
    /etc/init.d/rpcd restart
    sleep 2
    
    # 检查是否修复
    if ! ubus list | grep -q autoupdate; then
        echo "自动修复失败，尝试手动注册..."
        
        # 手动注册RPC方法
        ubus call service add '{"name":"autoupdate","exec":"/usr/libexec/rpcd/autoupdate.uc"}' 2>/dev/null
        
        # 再次检查
        if ! ubus list | grep -q autoupdate; then
            echo "手动注册失败，尝试修改RPC脚本..."
            
            # 创建一个更简单的RPC脚本
            cat > /usr/libexec/rpcd/autoupdate.uc <<EOF
#!/usr/bin/ucode
'use strict';

return {
    seturl: {
        args: { url: "string" },
        call: function(args) {
            let uci = require('uci');
            uci.load("autoupdate");
            uci.set("autoupdate", "main", "url", args.url);
            uci.commit("autoupdate");
            return { success: true };
        }
    },
    download: {
        call: function() {
            let uci = require('uci');
            let process = require('process');
            uci.load("autoupdate");
            let url = uci.get("autoupdate", "main", "url");
            if (!url || url == "")
                return { success: false, error: "未配置固件地址" };
                
            let code = process.run("/usr/bin/wget", [ "-O", "/tmp/firmware.bin", url ]);
            return { success: (code == 0) };
        }
    },
    upgrade: {
        call: function() {
            let process = require('process');
            process.run("/sbin/sysupgrade", [ "-c", "/tmp/firmware.bin" ]);
            return { success: true };
        }
    }
};
EOF
            chmod 755 /usr/libexec/rpcd/autoupdate.uc
            
            # 重启rpcd
            /etc/init.d/rpcd restart
            sleep 2
            
            # 最终检查
            if ubus list | grep -q autoupdate; then
                echo "[成功] RPC 服务已修复并注册"
            else
                echo "[失败] 修复失败，请检查系统配置"
            fi
        else
            echo "[成功] RPC 服务已手动注册"
        fi
    else
        echo "[成功] RPC 服务已自动修复"
    fi
else
    echo "[成功] RPC 服务已正常注册"
fi

# 检查和修复ACL文件
if [ ! -f /usr/share/rpcd/acl.d/luci-app-autoupdate.json ]; then
    echo "ACL 文件丢失，正在重新创建..."
    mkdir -p /usr/share/rpcd/acl.d/
    cat > /usr/share/rpcd/acl.d/luci-app-autoupdate.json <<EOF
{
    "luci-app-autoupdate": {
        "description": "Grant access to autoupdate procedures",
        "read": {
            "ubus": {
                "autoupdate": ["*"]
            },
            "uci": ["autoupdate"]
        },
        "write": {
            "ubus": {
                "autoupdate": ["*"]
            },
            "uci": ["autoupdate"]
        }
    }
}
EOF
    echo "[成功] ACL 文件已创建"
fi

# 清除LuCI缓存
rm -f /tmp/luci-indexcache
echo "LuCI 缓存已清除"

echo "===== 诊断信息 ====="
echo "已注册的 ubus 服务:"
ubus list | grep autoupdate
echo ""

echo "修复完成! 请重启浏览器并重试。"
echo "如果问题仍然存在，请运行: /etc/init.d/uhttpd restart"
ubus list
echo ""
echo "RPC 脚本内容:"
cat /usr/libexec/rpcd/autoupdate.uc
echo ""
echo "ACL 内容:"
cat /usr/share/rpcd/acl.d/luci-app-autoupdate.json
echo ""
echo "修复完成! 请重启浏览器并重试。如果问题仍然存在，请运行:"
echo "/etc/init.d/uhttpd restart"
echo "====================" 

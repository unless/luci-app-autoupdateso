#!/bin/sh

# 设置执行权限
chmod +x /usr/bin/autoupdate-debug.sh
chmod 755 /usr/libexec/rpcd/autoupdate.uc

# 检查 RPC 脚本是否存在
echo "检查 RPC 脚本..."
if [ -f /usr/libexec/rpcd/autoupdate.uc ]; then
    echo "[✓] RPC 脚本存在"
else
    echo "[✗] RPC 脚本不存在"
    exit 1
fi

# 检查执行权限
if [ -x /usr/libexec/rpcd/autoupdate.uc ]; then
    echo "[✓] RPC 脚本有执行权限"
else
    echo "[✗] RPC 脚本没有执行权限，正在设置..."
    chmod 755 /usr/libexec/rpcd/autoupdate.uc
fi

# 重启 rpcd 服务
echo "重启 rpcd 服务..."
/etc/init.d/rpcd restart
sleep 2

# 检查 ubus 是否注册了 autoupdate 对象
echo "检查 ubus 注册..."
if ubus list | grep -q autoupdate; then
    echo "[✓] autoupdate 对象已在 ubus 中注册"
else
    echo "[✗] autoupdate 对象未在 ubus 中注册"
    
    # 尝试手动加载
    echo "尝试手动加载 RPC 脚本..."
    ubus add_object "$(ucode -S /usr/libexec/rpcd/autoupdate.uc)"
    
    # 再次检查
    if ubus list | grep -q autoupdate; then
        echo "[✓] 手动加载成功"
    else
        echo "[✗] 手动加载失败"
    fi
fi

# 检查 ACL 文件
echo "检查 ACL 文件..."
if [ -f /usr/share/rpcd/acl.d/luci-app-autoupdate.json ]; then
    echo "[✓] ACL 文件存在"
else
    echo "[✗] ACL 文件不存在"
fi

# 清除 LuCI 缓存
echo "清除 LuCI 缓存..."
rm -f /tmp/luci-indexcache
echo "[✓] 完成"

echo ""
echo "调试信息汇总："
echo "=================="
echo "ubus 对象列表："
ubus list
echo ""
echo "autoupdate RPC 内容："
cat /usr/libexec/rpcd/autoupdate.uc
echo ""
echo "autoupdate ACL 内容："
cat /usr/share/rpcd/acl.d/luci-app-autoupdate.json
echo "=================="
echo "如需应用更改，请执行: /etc/init.d/uhttpd restart"

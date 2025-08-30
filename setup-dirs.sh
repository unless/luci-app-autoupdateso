#!/bin/sh

# 创建所需的目录结构
mkdir -p htdocs/luci-static/resources/view/autoupdate
mkdir -p root/usr/share/luci/menu.d
mkdir -p root/usr/share/rpcd/acl.d
mkdir -p root/etc/uci-defaults

# 设置权限
chmod +x setup-dirs.sh
echo "目录结构已创建完成"

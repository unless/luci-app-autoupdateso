# Maintainer: Soapman <soapmans@icloud.com>
pkgname=luci-app-autoupdate
pkgver=2.0
pkgrel=2
pkgdesc="Auto Firmware Update (ucode) for LuCI"
url="https://github.com/soapmancn/luci-app-autoupdate"
arch="noarch"
license="Apache-2.0"
# 只保留在Alpine中可用的依赖
depends="wget"
# 移除不必要的构建依赖
makedepends=""
install=""
subpackages=""
options="!check"
source=""

package() {
    mkdir -p "$pkgdir"
    cp -r "$srcdir"/../root/* "$pkgdir"/
    
    # LuCI files - 为新版 LuCI 设置正确的目录结构
    mkdir -p "$pkgdir"/usr/share/rpcd/acl.d/
    mkdir -p "$pkgdir"/www/luci-static/resources/view/autoupdate/
    
    # 创建ACL文件
    cat > "$pkgdir"/usr/share/rpcd/acl.d/luci-app-autoupdate.json <<EOF
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
    
    # 复制新的 JavaScript 视图文件
    if [ -d "$srcdir"/../htdocs/luci-static/resources/view/autoupdate ]; then
        cp -r "$srcdir"/../htdocs/luci-static/resources/view/autoupdate/* "$pkgdir"/www/luci-static/resources/view/autoupdate/
    fi
    
    # 设置正确的权限
    chmod 755 "$pkgdir"/usr/libexec/rpcd/autoupdate.uc
    chmod 644 "$pkgdir"/etc/config/autoupdate
    chmod 644 "$pkgdir"/usr/share/rpcd/acl.d/luci-app-autoupdate.json
    
    # 创建控制器 JSON 文件 (新版 LuCI 菜单方式)
    mkdir -p "$pkgdir"/usr/share/luci/menu.d/
    cat > "$pkgdir"/usr/share/luci/menu.d/luci-app-autoupdate.json <<EOF
{
    "admin/system/autoupdate": {
        "title": "固件更新",
        "order": 90,
        "action": {
            "type": "view",
            "path": "autoupdate/index"
        }
    }
}
EOF
    
    # 创建安装后脚本
    mkdir -p "$pkgdir"/etc/uci-defaults
    cat > "$pkgdir"/etc/uci-defaults/50_luci-app-autoupdate <<EOF
#!/bin/sh
# 添加防火墙允许规则（如需访问外部下载）
uci -q batch <<-END >/dev/null
	set firewall.autoupdate=rule
	set firewall.autoupdate.name='Allow-Autoupdate'
	set firewall.autoupdate.src='wan'
	set firewall.autoupdate.target='ACCEPT'
	set firewall.autoupdate.enabled='1'
	commit firewall
END

# 重启rpcd服务以加载新的RPC方法
/etc/init.d/rpcd restart

# 移除LuCI缓存
rm -f /tmp/luci-indexcache
exit 0
EOF
    chmod 755 "$pkgdir"/etc/uci-defaults/50_luci-app-autoupdate
}
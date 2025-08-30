# Maintainer: Soapman <soapmans@icloud.com>
pkgname=luci-app-autoupdate
pkgver=2.0
pkgrel=2
pkgdesc="Auto Firmware Update (ucode) for LuCI"
url="https://github.com/soapmancn/luci-app-autoupdate"
arch="noarch"
license="Apache-2.0"
depends="wget ucode luci-lib-jsonc luci-base"
makedepends=""
install=""
subpackages=""
options="!check"
source=""

package() {
    mkdir -p "$pkgdir"
    cp -r "$srcdir"/../root/* "$pkgdir"/
    
    # LuCI files - 正确设置ucode应用路径
    mkdir -p "$pkgdir"/usr/share/rpcd/acl.d/
    mkdir -p "$pkgdir"/usr/share/luci/menu.d/
    mkdir -p "$pkgdir"/usr/share/luci/controller/
    mkdir -p "$pkgdir"/usr/share/luci/view/
    
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
    
    # 复制视图和控制器文件
    cp -r "$srcdir"/../luasrc/view/* "$pkgdir"/usr/share/luci/view/
    cp -r "$srcdir"/../luasrc/controller/* "$pkgdir"/usr/share/luci/controller/
    
    # 创建菜单配置
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
    
    # 设置正确的权限
    chmod 755 "$pkgdir"/usr/libexec/rpcd/autoupdate.uc
    chmod 644 "$pkgdir"/etc/config/autoupdate
    chmod 644 "$pkgdir"/usr/share/rpcd/acl.d/luci-app-autoupdate.json
}
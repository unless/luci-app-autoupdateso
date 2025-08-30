# Maintainer: soapmans@icloud.com
pkgname=luci-app-autoupdate
pkgver=2.0
pkgrel=2
pkgdesc="Auto Firmware Update (ucode) for LuCI"
url="https://github.com/soapmancn/luci-app-autoupdate"
arch="noarch"
license="GPL-3.0"
depends="wget luci-base rpcd"
install=""
subpackages=""
source="root/etc/config/autoupdate root/usr/libexec/rpcd/autoupdate.uc luasrc/controller/autoupdate.uc luasrc/view/autoupdate/index.ut"

build() {
    # 无需编译，直接打包文件
    return 0
}

package() {
    # 配置文件
    install -Dm644 root/etc/config/autoupdate "$pkgdir/etc/config/autoupdate"

    # rpcd 脚本
    install -Dm755 root/usr/libexec/rpcd/autoupdate.uc "$pkgdir/usr/libexec/rpcd/autoupdate.uc"

    # LuCI ucode controller
    install -Dm644 luasrc/controller/autoupdate.uc "$pkgdir/usr/lib/lua/luci/controller/autoupdate.uc"

    # LuCI ucode view
    install -Dm644 luasrc/view/autoupdate/index.ut "$pkgdir/usr/share/ucode/luci/view/autoupdate/index.ut"
}
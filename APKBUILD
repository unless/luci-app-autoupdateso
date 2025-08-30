# Maintainer: Soapman <soapmans@icloud.com>
pkgname=luci-app-autoupdate
pkgver=2.0
pkgrel=2
pkgdesc="Auto Firmware Update (ucode) for LuCI"
url="https://github.com/soapmancn/luci-app-autoupdate"
arch="noarch"
license="Apache-2.0"
depends="wget"
makedepends=""
install=""
subpackages=""
options="!check"
source=""

package() {
    mkdir -p "$pkgdir"
    cp -r "$srcdir"/../root/* "$pkgdir"/
    
    # LuCI files
    mkdir -p "$pkgdir"/usr/share/ucode/luci
    cp -r "$srcdir"/../luasrc/* "$pkgdir"/usr/share/ucode/luci/
    
    # Set permissions
    chmod 755 "$pkgdir"/usr/libexec/rpcd/autoupdate.uc
    chmod 644 "$pkgdir"/etc/config/autoupdate
}
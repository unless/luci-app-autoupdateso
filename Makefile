include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Support for Auto Firmware Update (ucode)
LUCI_DEPENDS:=+wget +luci-base
LUCI_PKGARCH:=all

PKG_NAME:=luci-app-autoupdate
PKG_VERSION:=1.0
PKG_RELEASE:=1

include $(TOPDIR)/feeds/luci/luci.mk

# SPDX-License-Identifier: Apache-2.0
#
# Copyright (C) 2024 Soapman

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Auto Firmware Update (ucode) for LuCI
LUCI_PKGARCH:=all
LUCI_DEPENDS:= \
	+wget \
	+ucode \
	+ucode-mod-uci \
	+ucode-mod-ubus

PKG_NAME:=luci-app-autoupdate

define Package/luci-app-autoupdate/conffiles
/etc/config/autoupdate
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
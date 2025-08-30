include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-autoupdate
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_MAINTAINER:=soapmans@icloud.com

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=Applications
  TITLE:=Auto Firmware Update (ucode)
  DEPENDS:=+wget +luci-base +rpcd
  PKGARCH:=all
endef

define Package/$(PKG_NAME)/description
  Minimal LuCI app (ucode) to download firmware and trigger sysupgrade -c.
endef

define Build/Prepare
  true
endef

define Package/$(PKG_NAME)/install
	# 配置文件
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./root/etc/config/autoupdate $(1)/etc/config/autoupdate

	# rpcd 脚本
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./root/usr/libexec/rpcd/autoupdate.uc $(1)/usr/libexec/rpcd/autoupdate.uc

	# LuCI ucode controller & view
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(INSTALL_DATA) ./luasrc/controller/autoupdate.uc $(1)/usr/lib/lua/luci/controller/autoupdate.uc

	$(INSTALL_DIR) $(1)/usr/share/ucode/luci/view/autoupdate
	$(INSTALL_DATA) ./luasrc/view/autoupdate/index.ut $(1)/usr/share/ucode/luci/view/autoupdate/index.ut
endef

$(eval $(call BuildPackage,$(PKG_NAME)))

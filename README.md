# luci-app-autoupdate
auto update system for openwrt

## 安装说明

### 方式一：使用 Alpine 包管理器（推荐）
1. 将仓库添加到系统：
   ```
   echo "https://github.com/soapmancn/luci-app-autoupdate/releases/download/latest" >> /etc/apk/repositories
   ```
   或直接下载最新版本的 APK 文件

2. 安装软件包:
   ```
   apk update
   apk add luci-app-autoupdate
   ```
   或手动安装下载的 APK:
   ```
   apk add --allow-untrusted /path/to/luci-app-autoupdate-*.apk
   ```

3. 重启相关服务:
   ```
   /etc/init.d/rpcd restart
   /etc/init.d/uhttpd restart
   ```

4. 在 LuCI 界面的 "系统" -> "固件更新" 菜单中访问

### 方式二：对于使用 opkg 的传统 OpenWrt 系统
1. 下载 ipk 文件并安装:
   ```
   opkg update
   opkg install <下载的IPK文件路径>
   ```

## 常见问题

如果安装后无法在界面中找到此应用:

1. 清除LuCI缓存: `rm -f /tmp/luci-indexcache`
2. 重启uhttpd: `/etc/init.d/uhttpd restart`
3. 重启rpcd: `/etc/init.d/rpcd restart`
4. 刷新浏览器缓存

## 依赖

- wget
- ucode
- luci-base
- luci-lib-jsonc

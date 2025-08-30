'use strict';
'require view';
'require form';
'require ui';
'require uci';
'require rpc';
'require dom';

// 定义 RPC 方法，确保与服务端对应
var callAutoupdate = rpc.declare({
    object: 'autoupdate',
    method: 'seturl',
    params: ['url'],
    expect: { success: true }
});

var callDownload = rpc.declare({
    object: 'autoupdate',
    method: 'download',
    params: [],
    expect: { success: true }
});

var callUpgrade = rpc.declare({
    object: 'autoupdate',
    method: 'upgrade',
    params: [],
    expect: { success: true }
});

return view.extend({
    handleSaveApply: null,
    handleSave: null,
    handleReset: null,

    load: function() {
        return Promise.all([
            uci.load('autoupdate')
        ]);
    },

    render: function() {
        var m, s, o;

        m = new form.Map('autoupdate', _('固件更新'),
            _('设置固件下载地址并执行更新操作'));

        s = m.section(form.TypedSection, 'settings', _('设置'));
        s.anonymous = true;

        o = s.option(form.Value, 'url', _('固件下载地址'));
        o.rmempty = false;

        // 创建包含操作按钮的自定义部分
        s = m.section(form.NamedSection, 'main', 'settings', _('操作'));

        o = s.option(form.Button, '_download', _('下载固件'));
        o.inputtitle = _('开始下载');
        o.inputstyle = 'apply';
        o.onclick = function() {
            ui.showModal(_('下载固件'), [
                E('p', { 'class': 'spinning' }, _('正在下载固件，请稍候...')),
            ]);
            
            return callDownload().then(function(res) {
                ui.hideModal();
                if (res && res.success)
                    ui.addNotification(null, E('p', _('固件下载成功!')), 'success');
                else
                    ui.addNotification(null, E('p', _('固件下载失败: ') + ((res && res.error) || '未知错误')), 'danger');
            }).catch(function(err) {
                ui.hideModal();
                ui.addNotification(null, E('p', _('RPC 调用错误: ') + err.message), 'danger');
                console.error(err);
            });
        };

        o = s.option(form.Button, '_upgrade', _('立即升级'));
        o.inputtitle = _('开始升级');
        o.inputstyle = 'important';
        o.onclick = function() {
            if (!confirm(_('确定立即升级并保留配置吗？')))
                return;

            ui.showModal(_('系统升级'), [
                E('p', { 'class': 'spinning' }, _('正在执行升级，设备将会重启...')),
            ]);

            return callUpgrade().then(function() {
                // 不关闭模态框，因为系统会重启
                setTimeout(function() {
                    // 如果一分钟后还没有重启完成，提示用户手动刷新
                    ui.addNotification(null, E('p', _('升级可能已完成，请手动刷新页面')), 'info');
                }, 60000);
            }).catch(function(err) {
                ui.hideModal();
                ui.addNotification(null, E('p', _('升级失败: ') + err.message), 'danger');
                console.error(err);
            });
        };

        return m.render();
    }
});

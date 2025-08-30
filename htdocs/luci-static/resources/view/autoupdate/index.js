'use strict';
'require view';
'require form';
'require ui';
'require uci';
'require rpc';

var callAutoupdateSetUrl = rpc.declare({
    object: 'autoupdate',
    method: 'seturl',
    params: ['url'],
    expect: { success: true }
});

var callAutoupdateDownload = rpc.declare({
    object: 'autoupdate',
    method: 'download',
    expect: { success: true }
});

var callAutoupdateUpgrade = rpc.declare({
    object: 'autoupdate',
    method: 'upgrade',
    expect: { success: true }
});

return view.extend({
    handleSaveApply: null,
    handleSave: null,
    handleReset: null,

    load: function() {
        return uci.load('autoupdate');
    },

    render: function(data) {
        var m, s, o;

        m = new form.Map('autoupdate', _('固件更新'),
            _('设置固件下载地址并执行更新操作'));

        s = m.section(form.TypedSection, 'settings', _('设置'));
        s.anonymous = true;

        o = s.option(form.Value, 'url', _('固件下载地址'));
        o.rmempty = false;

        // 创建一个包含操作按钮的节
        s = m.section(form.NamedSection, 'main', 'settings', _('操作'));

        o = s.option(form.Button, '_download', _('下载固件'));
        o.inputtitle = _('开始下载');
        o.onclick = function() {
            return callAutoupdateDownload().then(function(res) {
                if (res.success)
                    ui.addNotification(null, E('p', _('固件下载成功!')));
                else
                    ui.addNotification(null, E('p', _('固件下载失败: ') + (res.error || '')));
            });
        };

        o = s.option(form.Button, '_upgrade', _('立即升级'));
        o.inputtitle = _('开始升级');
        o.onclick = function() {
            if (!confirm(_('确定立即升级并保留配置吗？')))
                return;

            return callAutoupdateUpgrade().then(function(res) {
                if (res.success)
                    ui.addNotification(null, E('p', _('系统开始升级，请等待...')));
                else
                    ui.addNotification(null, E('p', _('升级失败')));
            });
        };

        return m.render();
    }
});

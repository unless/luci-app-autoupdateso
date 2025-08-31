'use strict';
'require view';
'require form';
'require ui';
'require uci';
'require rpc';

// 定义 RPC 调用方法，适配新的接口格式
const callSetUrl = rpc.declare({
    object: 'luci.autoupdate',
    method: 'seturl',
    params: { type: 'url', content: 'String' },
    expect: { result: true }
});

const callDownload = rpc.declare({
    object: 'luci.autoupdate',
    method: 'download',
    expect: { result: true }
});

const callUpgrade = rpc.declare({
    object: 'luci.autoupdate',
    method: 'upgrade',
    expect: { result: true }
});

return view.extend({
    load: function() {
        return Promise.all([
            uci.load('autoupdate')
        ]);
    },

    render: function() {
        var m, s, o;

        // 添加样式让输入框左对齐（只插入一次）
        if (!document.getElementById('autoupdate-style')) {
            var style = document.createElement('style');
            style.id = 'autoupdate-style';
            // 让表单项整体左移，与标题左对齐
            style.innerHTML = '.cbi-section .cbi-value { margin-top:10px; max-width:500px; margin-left:-100px !important; }';
            document.head.appendChild(style);
        }

        m = new form.Map('autoupdate', _('固件更新'),
            _('设置固件下载地址并执行更新操作'));

        s = m.section(form.TypedSection, 'settings', _('设置'));
        s.anonymous = true;
        s.render = function(section_id) {
            var cfg = uci.get('autoupdate', 'settings') || {};
            var urlValue = cfg.url || '';
            var input = E('input', {
                type: 'text',
                class: 'cbi-input-text',
                style: 'width:350px;',
                value: urlValue,
                id: 'custom-url-input'
            });
            var saveBtn = E('button', {
                class: 'btn cbi-button cbi-button-apply',
                style: 'margin-left:10px;',
                click: function(ev) {
                    ev.preventDefault();
                    var val = document.getElementById('custom-url-input').value;
                    saveBtn.disabled = true;
                    callSetUrl({ type: 'url', content: val }).then(function(res) {
                        if (res && res.result) {
                            var modal = ui.showModal(_('保存成功'), [E('p', _('地址已保存'))]);
                            setTimeout(function() { ui.hideModal(); }, 1500);
                        } else {
                            var modal = ui.showModal(_('保存失败'), [E('p', _('保存失败: ') + ((res && res.error) || '未知错误'))]);
                            setTimeout(function() { ui.hideModal(); }, 2000);
                        }
                        uci.load('autoupdate').then(function() { window.location.reload(); });
                    }).catch(function(err) {
                        var modal = ui.showModal(_('保存失败'), [E('p', _('RPC错误: ') + err.message)]);
                        setTimeout(function() { ui.hideModal(); }, 2000);
                        saveBtn.disabled = false;
                    });
                }
            }, _('保存地址'));
            return E('div', { class: 'cbi-value', style: 'display:flex;align-items:center;' }, [
                E('label', { style: 'margin-right:10px;font-weight:bold;' }, _('固件下载地址')),
                input,
                saveBtn
            ]);
        };
    // 隐藏底部默认按钮
    var styleHideBtn = document.createElement('style');
    styleHideBtn.id = 'hide-default-save-btn';
    styleHideBtn.innerHTML = '.cbi-page-actions { display: none !important; }';
    document.head.appendChild(styleHideBtn);

        // 按钮区
        var btnSection = m.section(form.TypedSection, 'dummy');
        btnSection.anonymous = true;
        btnSection.render = function() {
            return E('div', { 'class': 'cbi-section' }, [
                E('button', {
                    'class': 'btn cbi-button cbi-button-apply',
                    'click': ui.createHandlerFn(this, function() {
                        ui.showModal(_('下载固件'), [
                            E('p', { 'class': 'spinning' }, _('正在下载固件，请稍候...'))
                        ]);
                        return callDownload().then(function(res) {
                            ui.hideModal();
                            if (res && res.result) {
                                var modal = ui.showModal(_('下载成功'), [
                                    E('p', _('固件下载成功!'))
                                ]);
                                setTimeout(function() {
                                    ui.hideModal();
                                }, 5000);
                            } else {
                                var modal = ui.showModal(_('下载失败'), [
                                    E('p', _('固件下载失败: ') + ((res && res.error) || '未知错误'))
                                ]);
                                setTimeout(function() {
                                    ui.hideModal();
                                }, 5000);
                            }
                        }).catch(function(err) {
                            ui.hideModal();
                            ui.addNotification(null, [
                                E('p', _('RPC 调用错误: ') + err.message),
                                E('pre', {}, err.stack)
                            ], 'danger');
                            console.error(err);
                        });
                    })
                }, [ _('下载固件') ]),
                ' ',
                E('button', {
                    'class': 'btn cbi-button cbi-button-negative',
                    'click': ui.createHandlerFn(this, function() {
                        if (!confirm(_('确定立即升级并保留配置吗？')))
                            return;
                        ui.showModal(_('系统升级'), [
                            E('p', { 'class': 'spinning' }, _('正在执行升级，设备将会重启...'))
                        ]);
                        return callUpgrade().then(function() {
                            setTimeout(function() {
                                ui.addNotification(null, E('p', _('升级可能已完成，请手动刷新页面')), 'info');
                            }, 60000);
                        }).catch(function(err) {
                            ui.hideModal();
                            ui.addNotification(null, E('p', _('升级失败: ') + err.message), 'danger');
                            console.error(err);
                        });
                    })
                }, [ _('立即升级') ])
            ]);
        };

        return m.render();
    }
});

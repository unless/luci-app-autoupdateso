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

        m = new form.Map('autoupdate', _('固件更新'),
            _('设置固件下载地址并执行更新操作'));

        s = m.section(form.TypedSection, 'settings', _('设置'));
        s.anonymous = true;

        o = s.option(form.Value, 'url', _('固件下载地址'));
        o.rmempty = false;
        // 让输入框和标题左对齐
        o.render = function() {
            // 只调整样式，不覆盖原有逻辑，防止返回 Promise
            o.widget = function(section_id, value) {
                var widget = form.Value.prototype.widget.apply(this, arguments);
                var wrapper = E('div', {
                    style: 'margin-left:-40px; max-width:500px; display:flex; align-items:center;'
                }, [widget]);
                return wrapper;
            };
        };
        // 保存按钮点击事件
        o.write = function(section_id, value) {
            // 先调用RPC写入
            return callSetUrl({ type: 'url', content: value }).then(function(res) {
                // RPC成功后，重新加载UCI配置并刷新表单
                return uci.load('autoupdate').then(function() {
                    window.location.reload();
                });
            });
        };

        s = m.section(form.TypedSection, 'settings');
        s.anonymous = true;
        s.render = function() {
            return E('div', { 'class': 'cbi-section' }, [
                E('button', {
                    'class': 'btn cbi-button cbi-button-apply',
                    'click': ui.createHandlerFn(this, function() {
                        ui.showModal(_('下载固件'), [
                            E('p', { 'class': 'spinning' }, _('正在下载固件，请稍候...'))
                        ]);
                        
                        return callDownload().then(function(res) {
                            ui.hideModal();
                            if (res && res.result)
                                ui.addNotification(null, E('p', _('固件下载成功!')), 'success');
                            else
                                ui.addNotification(null, E('p', _('固件下载失败: ') + 
                                    ((res && res.error) || '未知错误')), 'danger');
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
                    })
                }, [ _('立即升级') ])
            ]);
        };

        return m.render();
    }
});

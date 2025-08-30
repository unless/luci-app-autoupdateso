'use strict';
'require baseclass';
'require ui';

// 此文件在新版LuCI中主要由menu.d下的JSON文件替代
// 但保留此文件用于兼容性目的

return baseclass.extend({
    index: function() {
        return {
            "admin/system/autoupdate": {
                title: _("固件更新"),
                order: 90,
                action: {
                    type: "view",
                    path: "autoupdate/index"
                }
            }
        };
    }
});

'use strict';
'require baseclass';
'require view';

return baseclass.extend({
    index: function() {
        return {
            "admin/system/autoupdate": {
                title: _("固件更新"),
                order: 90,
                action: view("autoupdate/index")
            }
        };
    }
});

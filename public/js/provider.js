'use strict';

var resrvo_provider = {

    init: function() {

        $(".timepicker").datetimepicker({
            pickDate: false
        });

        $(".rdatepicker").datetimepicker({
            pickTime: false
        });

    }
};

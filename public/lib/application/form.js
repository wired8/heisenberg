'use strict';

var resrvo_form = {

    init: function (form_fields) {
        var self = this;

        Formbuilder.options.HTTP_ENDPOINT = '/management/bookingform';
        Formbuilder.options.BUTTON_CLASS = 'btn btn-primary';

        var builder = new Formbuilder({
            selector: '#resrvo_form',
            bootstrapData: form_fields
        });
    }
};

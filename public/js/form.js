'use strict';

var resrvo_form = {

    init: function () {
        var self = this;

        Formbuilder.options.HTTP_ENDPOINT = '/management/form';
        Formbuilder.options.BUTTON_CLASS = 'btn btn-primary';

        var builder = new Formbuilder({
            selector: '#resrvo_form',
            bootstrapData: [
                {
                    "label": "Please enter your clearance number",
                    "field_type": "text",
                    "required": true,
                    "field_options": {},
                    "cid": "c6"
                },
                {
                    "label": "Security personnel #82?",
                    "field_type": "radio",
                    "required": true,
                    "field_options": {"options": [
                        {"label": "Yes", "checked": false},
                        {"label": "No", "checked": false}
                    ],
                    "include_other_option": true},
                    "cid": "c10"
                },
                {
                    "label": "Medical history",
                    "field_type": "file",
                    "required": true,
                    "field_options": {},
                    "cid": "c14"
                }
            ]
        });
    }
};

resrvo_form.init();
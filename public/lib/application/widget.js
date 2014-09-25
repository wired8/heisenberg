'use strict';

var resrvo_widget = {

    init: function () {

        $('#widgetForm').bootstrapValidator({
            excluded: [':disabled', ':hidden', ':not(:visible)'],
            submitHandler: function(validator, form, submitButton) {
                validator.defaultSubmit();
            },
            message: 'This value is not valid',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            live: 'disabled',
            fields: {
                site_url: {
                    message: 'Site url is not valid',
                    validators: {
                        notEmpty: {
                            message: 'Site url is required and cannot be empty'
                        },
                        stringLength: {
                            min: 2,
                            max: 30,
                            message: 'url name must be more than 2 and less than 30 characters long'
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9_ ]+$/,
                            message: 'url can only consist of alphabetical, number and underscore'
                        }
                    }
                }
            }
        });
    }
};
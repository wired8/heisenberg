'use strict';

var resrvo_location = {

    init: function () {

        $('#locationForm').bootstrapValidator({
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
                name: {
                    message: 'Location name is not valid',
                    validators: {
                        notEmpty: {
                            message: 'Location name is required and cannot be empty'
                        },
                        stringLength: {
                            min: 2,
                            max: 30,
                            message: 'Location name must be more than 2 and less than 30 characters long'
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9_ ]+$/,
                            message: 'Location name can only consist of alphabetical, number and underscore'
                        }
                    }
                }
            }
        });
    }
};
'use strict';

var resrvo_provider = {

    init: function(provider_breaks) {

        var self = this;

        $(".timepicker").datetimepicker({
            pickDate: false
        });

        $(".rdatepicker").datetimepicker({
            pickTime: false
        });

        $("[name='break_sunday_from']").change(function() {
           self.setBreakSelect('break_sunday_from', 'break_sunday_to', provider_breaks);
        });

        $("[name='break_monday_from']").change(function() {
            self.setBreakSelect('break_monday_from', 'break_monday_to', provider_breaks);
        });

        $("[name='break_tuesday_from']").change(function() {
            self.setBreakSelect('break_tuesday_from', 'break_tuesday_to', provider_breaks);
        });

        $("[name='break_wednesday_from']").change(function() {
            self.setBreakSelect('break_wednesday_from', 'break_wednesday_to', provider_breaks);
        });

        $("[name='break_thursday_from']").change(function() {
            self.setBreakSelect('break_thursday_from', 'break_thursday_to', provider_breaks);
        });

        $("[name='break_friday_from']").change(function() {
            self.setBreakSelect('break_friday_from', 'break_friday_to', provider_breaks);
        });

        $("[name='break_saturday_from']").change(function() {
            self.setBreakSelect('break_saturday_from', 'break_saturday_to', provider_breaks);
        });


        $('#providerForm').bootstrapValidator({
            message: 'This value is not valid',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                first_name: {
                    message: 'First name is not valid',
                    validators: {
                        notEmpty: {
                            message: 'First name is required and cannot be empty'
                        },
                        stringLength: {
                            min: 2,
                            max: 30,
                            message: 'First name must be more than 2 and less than 30 characters long'
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9_]+$/,
                            message: 'First name can only consist of alphabetical, number and underscore'
                        }
                    }
                },
                last_name: {
                    message: 'Last name is not valid',
                    validators: {
                        notEmpty: {
                            message: 'Last name is required and cannot be empty'
                        },
                        stringLength: {
                            min: 2,
                            max: 30,
                            message: 'Last name must be more than 2 and less than 30 characters long'
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9_]+$/,
                            message: 'Last name can only consist of alphabetical, number and underscore'
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: 'Email is required and cannot be empty'
                        },
                        emailAddress: {
                            message: 'The input is not a valid email address'
                        }
                    }
                },
                 password: {
                    validators: {
                        identical: {
                            field: 'retype_password',
                            message: 'The password and its confirm are not the same'
                        }
                    }
                },
                retype_password: {
                    validators: {
                        identical: {
                            field: 'password',
                            message: 'The password and its confirm are not the same'
                        }
                    }
                }
            }
        });

    },

    setBreakSelect: function(selectFromName, selectToName, provider_breaks) {
        var index = parseInt($("[name='" + selectFromName + "']").get(0).selectedIndex,10);

        $("[name='" + selectToName + "'] option").remove();

        for (var provider_break in provider_breaks) {
            var val = provider_breaks[provider_break];
            $('<option/>').val(val).text(val).appendTo($("[name='" + selectToName + "']"));
        }

        if (index === 0) {
            return;
        }

        $("[name='" + selectToName + "'] option:lt(" + (index + 1) + ")").remove();
    }
};

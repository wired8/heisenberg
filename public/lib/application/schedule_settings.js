'use strict';

var resrvo_schedule_settings = {

    init: function() {

        $('.show-times').on('click', function(e) {
            var f = $(this.parentElement).children('.schedule-times-wrap');
            f.removeClass('hidden');
            $(this).addClass('hidden');
            var b = $(this.parentElement).children('.hide-times');
            b.removeClass('hidden');
        });

        $('.hide-times').on('click', function(e) {
            var f = $(this.parentElement).children('.schedule-times-wrap');
            f.addClass('hidden');
            $(this).addClass('hidden');
            var b = $(this.parentElement).children('.show-times');
            b.removeClass('hidden');
        });

    }

};

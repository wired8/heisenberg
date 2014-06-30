'use strict';

var resrvo_scheduler = {

    init: function() {
        var self = this;
        scheduler.config.xml_date="%Y-%m-%d %H:%i";
        scheduler.init('resrvo_scheduler',new Date(2014,8,4),"month");

        scheduler.templates.xml_date = function(value){ return new Date(value); };
        scheduler.load("/api/bookings/1", "json");

        var dp = new dataProcessor("/api/bookings");
        dp.init(scheduler);
        dp.setTransactionMode("POST", false);

    }
};
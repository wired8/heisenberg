'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Service = require('../models/Service'),
    _ = require('underscore'),
    Async = require('async'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * TimeSlot Controller
 */

module.exports.controller = function (app) {


    /**
     * GET /api/timeslots/:providerid/:date
     * Get available timeslots for a provider on a given date.
     *
     * @param request
     * @param response
     */
    app.get('/api/timeslots/:providerid/:serviceid/:date', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var provider_id = req.params.providerid;
        var service_id = req.params.serviceid;
        var date = req.params.date;
        var timeSlotService = Injct.getInstance('timeSlotService');

        timeSlotService.getAvailableTimeSlotsForProviderByDate(account_id, provider_id, service_id, date, function(err, result) {

            if (err) {
                res.send({ result: 'ERROR', err: err });
                return;
            }

            res.send({ result: 'OK',
                timeslots: result
            });

        });

    });

};
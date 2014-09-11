'use strict';

var Assert = require('assert'),
    Util = require('util'),
    TestUtil = require('../util.js'),
    AccountUtil = require('../common/AccountUtil.js'),
    ServiceUtil = require('../common/ServiceUtil.js'),
    ProviderUtil = require('../common/ProviderUtil.js'),
    ScheduleUtil  = require('../common/ScheduleUtil.js'),
    TimeSlotService = TestUtil.require('/services/TimeSlotService.js'),
    XDate = require('xdate'),
    Async = require('async'),
    _ = require('underscore');

var _accounts = [];
var _services = [];
var _providers = [];
var _schedules = [];

describe('TimeSlotServiceTests', function() {

    before(function(done) {
        TestUtil.setup(function() {

            Async.waterfall([createAccounts, createServices, createProviders, createSchedules], function(err, result) {
                done()
            });

            function createAccounts(cb) {
                new AccountUtil().createAccounts(5, function(err, accounts) {
                    _accounts = accounts;
                    cb(null, _accounts);
                });
            }

            function createServices(accounts, cb) {
                new ServiceUtil().createServices(5, accounts[0]._id.toString(), function (err, services) {
                    _services = services;
                    cb(null, accounts, services);
                });
            }

            function createProviders(accounts, services, cb) {
                new ProviderUtil().createProviders(10, accounts[0]._id.toString(), services, function (err, providers) {
                    _providers = providers;
                    cb(null, accounts,  providers);
                });
            }

            function createSchedules(accounts, providers, cb) {
                var provider_ids = _.map(providers, function(provider) {
                    return provider._id.toString();
                });
                new ScheduleUtil().createSchedules(10, accounts[0]._id.toString(), provider_ids, function (err, schedules) {
                    _schedules = schedules;
                    cb(null, 'done');
                });
            }
        });
    });

    after(TestUtil.tearDown);

    describe('Time Slots', function() {

        it('should be able to get available time slots for provider by date', function(done) {

           var from = new XDate('2014-1-1', true);
           var account_id = _accounts[0]._id.toString();
           var provider_id = _providers[0]._id.toString();
           var service_id = _services[0]._id.toString();

           new TimeSlotService().getAvailableTimeSlotsForProviderByDate(account_id, provider_id, service_id, from,  function(err, result) {

               Assert.ifError(err);
               Assert(result.length, 4);
               Assert(result[0], '09:00:AM');
               Assert(result[1], '10:30:AM');
               Assert(result[2], '13:30:AM');
               Assert(result[3], '16:30:AM');
               done();

           });
        });

     });

});
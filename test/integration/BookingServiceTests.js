'use strict';

var Assert = require('assert'),
    Util = require('util'),
    TestUtil = require('../util.js'),
    AccountUtil = require('../common/AccountUtil.js'),
    ServiceUtil = require('../common/ServiceUtil.js'),
    ProviderUtil = require('../common/ProviderUtil.js'),
    ScheduleUtil  = require('../common/ScheduleUtil.js'),
    BookingService = TestUtil.require('/services/BookingService.js'),
    Booking = TestUtil.require('/models/Booking.js'),
    XDate = require('xdate'),
    Async = require('async'),
    _ = require('underscore');

var _accounts = [];
var _services = [];
var _providers = [];
var _schedules = [];

describe('BookingServiceTests', function() {

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
                new ScheduleUtil().createSchedules(10, accounts[0]._id.toString(), providers, function (err, schedules) {
                    _schedules = schedules;
                    cb(null, 'done');
                });
            }
        });
    });

    after(TestUtil.tearDown);

    describe('Bookings', function() {

        it('should be able to create a new booking', function(done) {

            var from = new XDate('2014-1-1', true);
            var account_id = _accounts[0]._id.toString();
            var provider_id = _providers[0]._id.toString();
            var service_id = _services[0]._id.toString();

            var booking = new Booking({
                id: 1,
                account_id: account_id,
                first_name: 'Fred',
                last_name: 'Bloggs',
                phone: '555-555-5555',
                email: 'fred.blogg@gmail.com',
                start_date: new XDate(from).getTime(),
                end_date: new XDate(from).addHours(1).getTime(),
                service: service_id,
                provider: provider_id
            });

            new BookingService().updateBooking(booking, function(err, result) {

                Assert.ifError(err);
                Assert.equal(result.account_id, account_id);
                Assert.equal(result.provider, provider_id);
                done();

            });
        });

        it('should be able to delete a booking', function(done) {

            var from = new XDate('2014-1-1', true);
            var account_id = _accounts[0]._id.toString();
            var provider_id = _providers[0]._id.toString();
            var service_id = _services[0]._id.toString();

            var booking = new Booking({
                id: 1,
                account_id: account_id,
                first_name: 'Fred',
                last_name: 'Bloggs',
                phone: '555-555-5555',
                email: 'fred.blogg@gmail.com',
                start_date: new XDate(from).getTime(),
                end_date: new XDate(from).addHours(1).getTime(),
                service: service_id,
                provider: provider_id
            });

            new BookingService().deleteBooking(booking, function(err, result) {

                Assert.ifError(err);
                Assert.equal(result, 1, 'Should return 1');
                done();

            });
        });

    });

});
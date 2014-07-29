var Assert = require('assert'),
    Util = require('util'),
    TestUtil = require('../util.js'),
    AccountUtil = require('../common/AccountUtil.js'),
    ServiceUtil = require('../common/ServiceUtil.js'),
    ProviderUtil = require('../common/ProviderUtil.js'),
    TimeSlotService = TestUtil.require('/services/TimeSlotService.js'),
    XDate = require('xdate');

var _accounts = [];
var _services = [];
var _providers = [];

describe('TimeSlotServiceTests', function() {

    before(function(done) {
        TestUtil.setup(function() {
            new AccountUtil().createAccounts(5, function(err, accounts) {
                _accounts = accounts;

                new ServiceUtil().createServices(5, _accounts[0]._id.toString(), function (err, services) {
                    _services = services;
                    new ProviderUtil().createProviders(10, _accounts[0]._id.toString(), _services, function (err, providers) {
                        _providers = providers;
                        done();
                    });
                });
            });
        });
    });

    after(TestUtil.tearDown);

    describe('Time Slots', function() {

        it('should be able to get available time slots for provider by date', function(done) {

           var from = new XDate('2014-1-1 00:00', true).getTime();
           var to = new XDate('2014-1-1 23:59:59', true).getTime();
           var account_id = _accounts[0]._id.toString();
           var provider_id = _providers[0]._id.toString();

           new TimeSlotService().getAvailableTimeSlotsForProviderByDate(account_id, provider_id, from, to, function(err, result) {


               done();

           });
        });

     });

});
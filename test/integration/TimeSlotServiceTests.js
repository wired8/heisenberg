var Assert = require('assert'),
    Util = require('util'),
    TestUtil = require('../util.js'),
    ServiceUtil = require('../common/ServiceUtil.js'),
    ProviderUtil = require('../common/ProviderUtil.js'),
    TimeSlotService = TestUtil.require('/services/TimeSlotService.js'),
    XDate = require('xdate');


describe('TimeSlotServiceTests', function() {

    before(function(done) {
        TestUtil.setup(function() {
            done();
        });
    });
    after(TestUtil.tearDown);

    describe('Time Slots', function() {

        it('should be able to get available time slots for provider by date', function(done) {

           var from = new XDate('2014-1-1 00:00', true).getTime();
           var to = new XDate('2014-1-1 23:59:59', true).getTime();

           new TimeSlotService().getAvailableTimeSlotsForProviderByDate('1', '1', from, to, function(err, result) {

               done();

           });
        });

     });

});
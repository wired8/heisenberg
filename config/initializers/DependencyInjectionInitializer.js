'use strict';

var injct = require('injct'),
    util = require('util'),
    config = require('config'),
    redis = require('redis'),
    ServerBase = require('ServerBase'),
    Logger = ServerBase.Logger,
    DatabaseSetup = require('./DatabaseSetup.js'),
    LeaderBoardService = require('RedLeader').LeaderBoardService,
    LeaderBoardGroupService = require('RedLeader').LeaderBoardGroupService,
    Constants = require('../../app/util/Constants.js'),
    MetadataUpdater = require('../../app/jobs/MetadataUpdater.js');

/**
 * Init all dependency injection references
 */
exports.init = function (cb) {

    ServerBase.init(injct, {
        redis: config.get('redis'),
        pubnub: config.get('pubnub'),
        androidApp: config.get('androidApp'),
        iosApp: config.get('iosApp'),
        metaDataServer: config.get('metaDataServer')
    }, done);

    function done() {

        setupDependencies(function() {

            injct.getInstance('presenceService').monitorPresence();

            injct.getInstance('redisExpireNotificationService')
                .monitorExpiredKeys();

            new DatabaseSetup(cb);

            var metadadaConfig = config.get('metaDataServer');
            MetadataUpdater.init(metadadaConfig.currentVersion, metadadaConfig.server_version);
            MetadataUpdater.updateInMemoryValues();

        });

    }

};

/**
 * Setup dependencies
 *
 * @param cb
 */
function setupDependencies(cb) {

    injct.unique({
        userRepository: reqRepository('UserRepository'),
        configurationRepository: reqRepository('ConfigurationRepository'),
        matchRepository: reqRepository('MatchRepository'),
        matchService: reqService('MatchService'),
        userCharacterRepository: reqRepository('UserCharacterRepository'),
        userService: reqService('UserService'),
        botService: reqService('BotService'),
        itemRepository: reqRepository('ItemRepository'),
        itemService: reqService('ItemService'),
        redLeaderService: reqService('RedLeaderService'),
        redLeaderBoardService: LeaderboardFactory,
        leaderBoardService: reqService('LeaderBoardService'),
        presenceService: reqService('PresenceService'),
        pushNotificationService: reqService('PushNotificationService'),
        redisSubscriberClient: RedisSubscriberClient,
        redisEnergyClient: RedisEnergyClient,
        energyService: reqService('EnergyService'),
        analyticsService: reqService('AnalyticsService'),
        friendService: reqService('FriendService'),
        giftRepository: reqRepository('GiftRepository'),
        giftService: reqService('GiftService'),
        bossService: reqService('BossService'),
        redisExpireNotificationService: reqService('RedisExpireNotificationService'),
        redLeaderBoardGroupService: LeaderboardGroupServiceFactory,
        adminRepository: reqRepository('AdminRepository'),
        adminService: reqService('AdminService'),
        noticeRepository: reqRepository('NoticeRepository'),
        noticeService: reqService('NoticeService'),
        teamService: reqService('TeamService'),
        adminRoleRepository: reqRepository('AdminRoleRepository'),
        roleRouteRepository: reqRepository('RoleRouteRepository'),
        rankingService: reqService('RankingService'),
        invitationRepository: reqRepository('InvitationRepository'),
        newCharacterEvent: req('/events/NewCharacterEvent'),
        evolutionService: reqService('EvolutionService'),
        headToHeadRepository: reqRepository('HeadToHeadRepository'),
        purchasingService: reqService('PurchasingService'),
        preRegRepository: reqRepository('PreRegRepository'),
        preRegService: reqService('PreRegService'),
        emailService: reqService('EmailService'),
        narrativeRepository: reqRepository('NarrativeRepository')
    });

    if (cb) {
        cb();
    }
}
exports.setupDependencies = setupDependencies;

/**
 * Create a redis client
 *
 * @returns {*}
 * @constructor
 */
function RedisClient() {
    var redis_config = config.get('redis');
    var redisClient = redis.createClient(redis_config.port, redis_config.host);
    redisClient.on('ready', function() {
        redisClient.enable_offline_queue = false;
    });
    return redisClient;

}

/**
 * Create a redis client
 *
 * @returns {*}
 * @constructor
 */
function RedisSubscriberClient() {

    return RedisClient();
}

function RedisEnergyClient() {

    var client = RedisClient();

    Logger.info("Selecting database 1 for redis energy");

    client.select(1, function(err) {
        if (err) {
            Logger.error("There was an error selecting the client", err);
        }
    });
    return client;
}

/**
 * Leaderboard factory
 *
 * @returns {LeaderBoardService}
 * @constructor
 */
function LeaderboardFactory() {

    return new LeaderBoardService({
        pageLength: 10,
        redisClient: injct.getInstance('redisClient'),
        sharedRank: true,
        lowerIsBetter: false,
        highScore: true,
        name: 'WOT'
    });

}

function LeaderboardGroupServiceFactory() {

    return new LeaderBoardGroupService({
        redis: injct.getInstance('redisClient')
    });
}

/**
 * Helper to require a service
 *
 * @param service
 * @returns {*}
 */
function reqService(service) {
    return req(util.format('/services/%s.js', service));
}

/**
 * Helper to require a repository
 *
 * @param repository
 * @returns {*}
 */
function reqRepository(repository) {
    return req(util.format('/repository/%s.js', repository));
}

/**
 * Helper to require relative to app
 *
 * @param pkg
 * @returns {*}
 */
function req(pkg) {
    return require('../../app' + pkg);
}
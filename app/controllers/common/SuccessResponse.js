'use strict';

var XDate = require('xdate'),
    AssetBundleUtil = require('../../util/AssetBundle.js'),
    Encryption = require('../../util/Encryption.js'),
    Functions = require('../../util/Functions.js'),
    WeeklyRanking = require('../../util/WeeklyRanking.js'),
    Config = require('config'),
    Util = require('util');

/**
 * Creates a success response
 *
 * @param {Request} request
 *  the current request
 *
 * @param {Object} object
 *  the result object
 *
 * @param {User} user
 *  the logged user
 *
 * @param {Boolean} disableEncrypt
 *  encrypt the response right away, default is true
 *
 * @constructor
 */
var SuccessResponse = function(request, object, user, disableEncrypt) {

	this.success = true;
	if (user) {
		this.user = user;
		this.user.session_tokens = request.session.tokens;
	}

    var metadataInfo = getMetadataVersionAndHash(request);

	this.current_hash = metadataInfo.hash;
	this.current_version = 200; //TODO check current version
	this.current_url = metadataInfo.url;
	this.server_ts = new XDate(true).getTime(); //UTC time
    this.ranking_expire_at = WeeklyRanking.rankingExpireAt();
	this.result = object || {};

    if (!disableEncrypt) {
        this.encrypt(request);
    }
};

/**
 * Encrypt the response
 *
 */
SuccessResponse.prototype.encrypt = function(request) {

    var self = this;

    var disableBodyResponseEncrypt = Config.get('disable_body_response_encrypt');

    if (!request.acceptsBodyEncryption || disableBodyResponseEncrypt) {
        return self;
    }

    var clone = JSON.stringify(self);

    for (var key in self) {
        delete self[key];
    }

    self.enc_body = Encryption.encryptBody(clone);
    return self;
};

module.exports = SuccessResponse;

function getMetadataVersionAndHash(req) {

    var metadataLastSupported = Config.get('metaDataLastVersionPerRelease');
    var metadataConfig = Config.get('metaDataServer');

    var clientVersion = Functions.getClientVersion(req);

    if (metadataLastSupported[clientVersion]) {

        console.error("Returning old metadata information");

        var versionSupport = metadataLastSupported[clientVersion];
        var dbEndpoint = "http://"+metadataConfig.host + Util.format(metadataConfig.db_pattern, versionSupport.version);

        return {
            hash: versionSupport.md5,
            url: dbEndpoint
        };

    }

    return {
        hash: AssetBundleUtil.assetBundleHash(),
        url: AssetBundleUtil.assetBundleUrl()
    };

}

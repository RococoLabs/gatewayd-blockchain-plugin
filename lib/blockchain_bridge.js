var async = require("async");
var config = require("../config/config.js");
var coindaemon = require("node-dogecoin")();
coindaemon.set("user", config.get("bitcoind").user);
coindaemon.set("password", config.get("bitcoind").pass);
coindaemon.auth(config.get("bitcoind").user, config.get("bitcoind").pass);

function BlockchainBridge(gatewayd, rippleAddress) {
  this.gatewayd = gatewayd;
  this.rippleAddress = rippleAddress;
}

BlockchainBridge.prototype.getBlockchainBridge = function(callback) {
  return async.waterfall([
    this._getExternalAccount.bind(this),
    this._getNewBlockchainAddress.bind(this),
    this._registerBlockchainBridge.bind(this)
  ], callback);
};

BlockchainBridge.prototype._getExternalAccount = function(callback) {
  return this.gatewayd.data.models.externalAccounts.find({
    where: {
      uid: this.rippleAddress
    }
  }).complete(callback);
};

BlockchainBridge.prototype._getNewBlockchainAddress = function(externalAccount, callback) {
  if (externalAccount) {
    return callback(null, externalAccount, null);
  } else {
    coindaemon.getNewAddress(function(error, address) {
      if (error) {
        return callback(error, null, null);
      } else {
        return callback(null, null, address);
      }
    });
  }
};

BlockchainBridge.prototype._registerBlockchainBridge = function(externalAccount, blockchainAddress, callback) {
  if (externalAccount) {
    return callback(null, externalAccount);
  } else {
    return this.gatewayd.data.models.externalAccounts.create({
      name: blockchainAddress,
      uid: this.rippleAddress,
      user_id: 1
    }).complete(callback);
  }
};

module.exports = BlockchainBridge;


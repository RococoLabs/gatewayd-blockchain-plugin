var config = require("../config/config.js");
var coindaemon = require("node-dogecoin")();
coindaemon.set("user", config.get("bitcoind").user);
coindaemon.set("password", config.get("bitcoind").pass);
coindaemon.auth(config.get("bitcoind").user, config.get("bitcoind").pass);

var BlockchainAddressValidator, request;

request = require("superagent");

BlockchainAddressValidator = (function() {
  function BlockchainAddressValidator(gatewayd) {
    this.gatewayd = gatewayd;
  }

  BlockchainAddressValidator.prototype.validate = function(address, callback) {
    coindaemon.validateaddress(address, function(error, info) {
      if (error) {
        return callback(error, null);
      } else {
        return callback(null, info.isvalid);
      }
    });
  };

  return BlockchainAddressValidator;

})();

module.exports = BlockchainAddressValidator;

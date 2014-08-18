
const BlockchainAddressValidator = require(__dirname+"/dogecoin_address_validator");

function RippleToBlockchainBridge(blockchainAddress, gatewayd) {
  var error;
  this.blockchainAddress = blockchainAddress;
  this.gatewayd = gatewayd;
  if (!this.blockchainAddress) {
    error = new Error;
    error.field = "blockchainAddress";
    error.message = "invalid blockchain address";
    return error;
  }
}

RippleToBlockchainBridge.prototype._validateBlockchainAddress = function(callback) {
  var blockchainAddressValidator = new BlockchainAddressValidator(this.gatewayd);
  return blockchainAddressValidator.validate(this.blockchainAddress, callback);
};

RippleToBlockchainBridge.prototype._getBlockchainAddressRecord = function(callback) {
  this.gatewayd.data.models.externalAccounts.findOrCreate({
    name: this.blockchainAddress
  }).complete(callback);
};

RippleToBlockchainBridge.prototype.getRippleAddress = function(callback) {
  this._validateBlockchainAddress(function(error, isvalid) {
    if (error || !isvalid) {
      error = new Error;
      error.field = "blockchainAddress";
      error.message = "invalid blockchain address";
      callback(error, null);
    } else {
      _this.gatewayd.data.models.externalAccounts.findOrCreate({
        name: _this.blockchainAddress,
        user_id: 0
      }).complete(function(error, externalAccount) {
        callback(error, {
          address: _this.gatewayd.config.get('COLD_WALLET'),
          tag: externalAccount.id
        });
      });
    }
  });
};

module.exports = RippleToBlockchainBridge;


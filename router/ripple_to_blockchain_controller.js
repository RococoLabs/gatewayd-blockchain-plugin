var RippleToBlockchainBridge = require("" + __dirname + "/ripple_to_blockchain_bridge");

function RippleToBlockchainBridgeController(gatewayd) {
  this.gatewayd = gatewayd;
}

RippleToBlockchainBridgeController.prototype.get = function(request, response) {
  var bridge = new RippleToBlockchainBridge(request.params.address, this.gatewayd);
  bridge.getRippleAddress(function(error, rippleAddress) {
    if (error) {
      response.status(500).end();
    } else {
      response.status(200).send({
        dogecoin: {
          address: request.params.address
        },
        ripple: {
          address: rippleAddress.address,
          tag: rippleAddress.tag
        }
      });
    }
  });
};

module.exports = RippleToBlockchainBridgeController;


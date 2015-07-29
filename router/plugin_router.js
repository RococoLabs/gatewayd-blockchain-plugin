var BlockchainToRippleController, BlockchainBridgeRouter, RippleToBlockchainController, express;

express = require("express");

BlockchainToRippleController = require("" + __dirname + "/blockchain_to_ripple_controller");
RippleToBlockchainController = require("" + __dirname + "/ripple_to_blockchain_controller");

BlockchainBridgeRouter = function(options) {
  var blockchainToRippleController = new RippleToBlockchainController(options.gatewayd);
  var rippleToBlockchainController = new BlockchainToRippleController(options.gatewayd);
  var router = new express.Router();
  router.get("/blockchain-to-ripple/:name", blockchainToRippleController.get);
  router.get("/ripple-to-blockchain/:address", rippleToBlockchainController.get);
  return router;
};

module.exports = BlockchainBridgeRouter;

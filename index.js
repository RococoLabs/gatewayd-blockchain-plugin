var blockchainBridgeRouter = require(__dirname+'/router/plugin_router.js');

function BlockchainPlugin(options) {
  var options = options || {};
  this.gatewayd = options.gatewayd;
  this.router = blockchainBridgeRouter;
  this.processes = {
    'blockchain_deposits': __dirname+'/processes/blockchain_deposits_processor.js',
    'blockchain_withdraws': __dirname+'/processes/blockchain_withdrawals_processor.js',
    'external_accounts_to_blockchain': __dirname+'/processes/external_accounts_to_blockchain.js',
  };
}

module.exports = BlockchainPlugin;

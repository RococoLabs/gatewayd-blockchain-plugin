const BlockchainPlugin = require('../gatewayd-blockchain-plugin');

module.exports = function(gatewayd) {
  
  const blockchainPlugin = new BlockchainPlugin({
    gatewayd: gatewayd
  }); 

  gatewayd.server.use('/', blockchainPlugin);
 
};


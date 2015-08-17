const BlockchainPlugin = require('./gatewayd-blockchain-plugin');

module.exports = function(gatewayd) {
  
  const blockchainPlugin = new BlockchainPlugin({
    gatewayd: gatewayd
  }); 

  for (var processname in blockchainPlugin.processes) {
    gatewayd.processes.add(processname, blockchainPlugin.processes[processname]);
  }
  gatewayd.server.use('/', blockchainPlugin);
 
};


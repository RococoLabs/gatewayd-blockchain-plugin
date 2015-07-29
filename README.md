## Blockchain Gatewayd Plugin

### Installation

    npm install --save blockchain-gatewayd-plugin

### Usage

In the Gatewaydfile.js of your gatewayd installation

      const BlockchainPlugin = require('blockchain-gatewayd-plugin');
      const BlockchainClient = require('blockchain-monitor').Client;

      const blockchainPlugin = new BlockchainPlugin({
        gatewayd: gatewayd,
        blockchainClient: new BlockchainClient({
          host: '127.0.0.1',
          port: 22555,
          https: false,
          user: 'rpcUser',
          pass: 'rpcPassword',
          type: 'bitcoin'
        })
      }); 

      // will mount blockchainPlugin.router at '/blockchain-bridge' in gatewayd.server
      // will also start each process listed in processes 
      gatewayd.plugins.register({
        plugin: blockchainPlugin,
        name: 'blockchain',
        route: '/blockchain-bridge',
        processes: blockchainPlugin.processes
      });

`blockchainPlugin.processes` is an object containg names processes of and paths to
their file to be executed by pm2.

For instance, in `blockchain-gatewayd-plugin/processes/new_addresses.js`
 
      const gatewayd = require(process.env.GATEWAYD_PATH);

      gatewayd.plugins.blockchain.workers.newAddresses.start();


const gatewayd = require(__dirname+'/../../');
const QueueWorker = require('sql-mq-worker');
const blockchain =  require('blockchain-monitor');
var config = require('../config/config.js');

const blockchainClient = new blockchain.Client(config.get('bitcoind'));
var coinDaemon = blockchainClient.coinDaemon; //dc: there is no need to use blockchain-monitor for this, we can use node-dogecoin directly


const worker = new QueueWorker({
  Class: gatewayd.data.models.externalAccounts,
  predicate: { where: {
    name: 'default'
  }},
  job: function(externalAccount, next) {
    coinDaemon.getnewaddress(function(error, address) {
      if (error) {
        console.log('ERROR', error);
        return next();
      }
      externalAccount.updateAttributes({
        name: address
      }).complete(function(error, externalAccount) {
        if (error) {
          console.log('ERROR', error);
        } else {
          console.log('UPDATED', externalAccount);
        }
        next();
      });
    });
  }
});

worker.start();


var config = require('nconf');

config
  .argv()
  .env()
  .file({ file: __dirname+'/config.json' });

config.defaults({
  'environment': 'development',

  'gatewayd' : {
    'domain': '192.168.37.37',
    'apiAdmin': '',
    'apiKey': 'qoral',
  },

  'bitcoindLastBlockHash': '',
  'bitcoind' : {
    'rpcHost': '192.168.37.37',
    'rpcPort': 18332,
    'rpcUser': 'bitcoindrpc',
    'rpcPass': 'scQja82SdSNEC6GWbAjaUDHfHFnbbjpW2rPaNzT',
    'rpcMethod': 'POST',
    'rpcHttps': false,
    'confirmations': 3,
    'walletPassphrase': 'mywalletpassphrase',
    'type': 'bitcoin',
    'acronym': 'BTC'
  },
});


module.exports = config;
  

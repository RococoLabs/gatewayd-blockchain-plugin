var listNextBlock, listSinceBlock, pollForBitcoindWithdrawals, createWithdrawalOnGatewayd;
var EventEmitter, config, emitter, request, _;
var coinDaemon, CoinDaemon, bitcoindconf, gatewaydconf;

CoinDaemon  = require('node-dogecoin');
request     = require('superagent');
_           = require('underscore-node');
config      = require('' + __dirname + '/../config/config.js');


pollForBitcoindWithdrawals = function(callback) {
  return listNextBlock(config.get('bitcoindLastBlockHash'), function(error, transactions) {
    if (error) {
      return callback(callback);
    } else if (transactions && transactions.length > 0) {
      if (transactions[0].blockhash) {
        //emmit an event for the received block that an eventhandler will process
        emitter.emit('block', transactions);
        config.set('bitcoindLastBlockHash', transactions[0].blockhash);
        config.save();
      }
      return callback(callback);
    } else {
      return callback(callback);
    }
  });
};

listNextBlock = function(lastBlock, callback) {
  return listSinceBlock(lastBlock, function(error, transactions) {
    var nextBlock, nextBlockHash;
    if (error || !transactions || transactions.length === 0) {
      callback(error, null);
      return;
    }
    nextBlockHash = transactions[0].blockhash;
    nextBlock = _.filter(transactions, function(transaction) {
      return transaction.blockhash === nextBlockHash;
    });
    return callback(null, nextBlock);
  });
};

listSinceBlock = function(lastBlock, callback) {
  var confirmations = bitcoindconf.confirmations;
  coinDaemon.listsinceblock(lastBlock, confirmations, function(error, response) {
    if (error) {
      return callback(error, null);
    }
    var sorted;
    try {
      sorted = _.sortBy(response.transactions, function(transaction) {
        return transaction.blocktime;
      });
      return callback(null, sorted);
    }
    catch (_error) {
      error = _error;
      return callback(error, null);
    }
  });
};

createWithdrawalOnGatewayd = function(transactions) {
  return transactions.forEach(function(transaction) {
    request.get(gatewaydconf.domain + '/v1/external_accounts?name=' + transaction.address)
           .auth(gatewaydconf.apiAdmin, gatewaydconf.apiKey)
           .end(function(error, response) {
              var externalAccount;
              if (error) {
                return console.log('error', error);
              }
              else if (response.body.external_accounts && response.body.external_accounts.length > 0) {
                externalAccount = response.body.external_accounts[0];
                return request.post(gatewaydconf.domain + '/v1/deposits')
                              .auth(gatewaydconf.apiAdmin, gatewaydconf.apiKey)
                              .send({
                                external_account_id: externalAccount.id,
                                currency: bitcoindconf.acronym,
                                amount: transaction.amount,
                                data: null
                              })
                              .end(function(error, response) {
                                if (error) {
                                  return console.log('error', error);
                                } else {
                                  return console.log(response.body);
                                }
                              });
              }
              else {
                return console.log('no account found');
              }
            });
    return console.log(transaction);
  });
};


if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

gatewaydconf = config.get('gatewayd');
bitcoindconf = config.get('bitcoind');
var coinoptions = {
  host: bitcoindconf.rpcHost,
  port: bitcoindconf.rpcPort,
  user: bitcoindconf.rpcUser,
  pass: bitcoindconf.rpcPass,
  method: bitcoindconf.rpcMethod,
  https: bitcoindconf.rpcHttps,
  ca: null,//fs.readFileSync('./test/test.crt');,
  passphrasecallback: function (command, args, callback) {
    var error = null;
    var passphrase = bitcoindconf.walletPassphrase;
    var timeout = 30;
    callback(error, passphrase, timeout);
  }
};

coinDaemon = CoinDaemon(coinoptions);
// coinDaemon.set('user', config.get('bitcoind').user);
// coinDaemon.set('password', config.get('bitcoind').pass);
// coinDaemon.auth(config.get('bitcoind').user, config.get('bitcoind').pass);


EventEmitter = require('events').EventEmitter;
emitter = new EventEmitter();
emitter.on('block', createWithdrawalOnGatewayd);

pollForBitcoindWithdrawals(pollForBitcoindWithdrawals);

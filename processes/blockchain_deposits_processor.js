var EventEmitter, config, emitter, listNextBlock, listSinceBlock, pollForBitcoindDeposits, createDepositOnGatewayd, request, _;
var gatewaydDomain, gatewaydApiAdmin, gatewaydApiKey;

request = require("superagent");
_ = require("underscore-node");
config = require("" + __dirname + "/../config/config.js");
var coindaemon = require("node-dogecoin")();
coindaemon.set("user", config.get("bitcoind").user);
coindaemon.set("password", config.get("bitcoind").pass);
coindaemon.auth(config.get("bitcoind").user, config.get("bitcoind").pass);



pollForBitcoindDeposits = function(callback) {
  return listNextBlock(config.get("bitcoindLastBlockHash"), function(error, transactions) {
    if (error) {
      return callback(callback);
    } else if (transactions && transactions.length > 0) {
      if (transactions[0].blockhash) {
        //emmit an event for the received block that an eventhandler will process
        emitter.emit("block", transactions);
        config.set("bitcoindLastBlockHash", transactions[0].blockhash);
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
    if (!transactions || transactions.length === 0) {
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

listSinceBlock = function(block, callback) {
  var confirmations = config.get("bitcoind").confirmations;
  coindaemon.listsinceblock(block, confirmations, function(error, received) {
    var sorted;
    try {
      sorted = _.sortBy(received.transactions, function(transaction) {
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

createDepositOnGatewayd = function(transactions) {
  return transactions.forEach(function(transaction) {
    request.get(gatewaydDomain + "/v1/external_accounts?name=" + transaction.address)
           .auth(gatewaydApiAdmin, gatewaydApiKey)
           .end(function(error, response) {
              var externalAccount;
              if (error) {
                return console.log("error", error);
              }
              else if (response.body.external_accounts && response.body.external_accounts.length > 0) {
                externalAccount = response.body.external_accounts[0];
                return request.post(gatewaydDomain + "/v1/deposits")
                              .auth(gatewaydApiAdmin, gatewaydApiKey)
                              .send({
                                external_account_id: externalAccount.id,
                                currency: config.get("bitcoind").acronym,
                                amount: transaction.amount
                              })
                              .end(function(error, response) {
                                if (error) {
                                  return console.log("error", error);
                                } else {
                                  return console.log(response.body);
                                }
                              });
              }
              else {
                return console.log("no account found");
              }
            });
    return console.log(transaction);
  });
};


if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

gatewaydDomain = config.get("gatewayd").domain;
gatewaydApiAdmin = config.get("gatewayd").apiAdmin;
gatewaydApiKey = config.get("gatewayd").apiKey;

EventEmitter = require("events").EventEmitter;
emitter = new EventEmitter();
emitter.on("block", createDepositOnGatewayd);

pollForBitcoindDeposits(pollForBitcoindDeposits);

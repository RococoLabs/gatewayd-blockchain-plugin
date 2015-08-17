var SqlMqWorker, async, clearDeposit, getDeposit, getDepositAddress, loopAndProcessDeposit, request, sendCoins;
var gatewaydDomain, gatewaydApiAdmin, gatewaydApiKey;

var config = require(__dirname + "/../config/config.js");
var coindaemon = require("node-dogecoin")();
coindaemon.set("user", config.get("bitcoind").user);
coindaemon.set("password", config.get("bitcoind").pass);
coindaemon.auth(config.get("bitcoind").user, config.get("bitcoind").pass);


loopAndProcessDeposit = function(callback) {
  return async.waterfall([
    function(next) {
      return getDeposit(next);
    },
    function(deposit, next) {
      return getDepositAddress(deposit.external_account_id, function(error, externalAccount) {
        if (error) {
          console.log("getDepositAddress::error", error);
          return next(error, null);
        } else {
          console.log("getDepositAddress::address", externalAccount);
          return next(null, deposit, externalAccount);
        }
      });
    },
    function(deposit, externalAccount, next) {
      var depositdata = {
        amount: deposit.amount,
        address: externalAccount.uid
      };
      return sendCoins(depositdata, function(error, response) {
        return next(error, deposit);
      });
    },
    function(deposit, next) {
      return clearDeposit(deposit, next);
    }
  ],
  function(error, clearedDeposit) {
    return setTimeout((function() {
      return callback(callback);
    }), 2000);
  });
};

getDeposit = function(callback) {
  return request.get(gatewaydDomain + "/v1/withdrawals").auth(gatewaydApiAdmin, gatewaydApiKey).end(function(error, response) {
    var deposit;
    if (error) {
      return callback(error, null);
    }
    else {
      deposit = response.body.withdrawals[0];
      if (deposit) {
        return callback(null, deposit);
      }
      else {
        return callback("no deposits", null);
      }
    }
  });
};

getDepositAddress = function(externalAccountId, callback) {
  return request.get(gatewaydDomain + "/v1/external_accounts/" + externalAccountId).auth(gatewaydApiAdmin, gatewaydApiKey).end(function(error, response) {
    if (error) {
      return callback(error, null);
    }
    else {
      console.log("getDepositAddress::response", response.body);
      return callback(null, response.body.external_account);
    }
  });
};

sendCoins = function(options, callback) {
  coindaemon.sendtoaddress(options.address, options.amount, function(error, transaction) {
    if(error) {
      console.log("SEND COINS ERROR", error);
    }
    else {
      console.log("SENT COINS", transaction);
    }
    return callback(error, transaction);
  }); 
};

clearDeposit = function(deposit, callback) {
  var url;
  url = gatewaydDomain + "/v1/withdrawals/" + deposit.id + "/clear";
  console.log("clearDeposit", url);
  return request.post(url).auth(gatewaydApiAdmin, gatewaydApiKey).send({}).end(function(error, response) {
    console.log("deposit::clear::success", response.body);
    console.log("deposit::clear::error", response.error);
    return callback(error, response);
  });
};

request = require("superagent");
async = require("async");
SqlMqWorker = require("sql-mq-worker");

gatewaydDomain = config.get("gatewayd").domain;
gatewaydApiAdmin = config.get("gatewayd").apiAdmin;
gatewaydApiKey = config.get("gatewayd").apiKey;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

loopAndProcessDeposit(loopAndProcessDeposit);

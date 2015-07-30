var SqlMqWorker, async, clearWithdrawal, getWithdrawal, getWithdrawalAddress, loopAndProcessWithdrawal, request, sendCoins;
var gatewaydDomain, gatewaydApiAdmin, gatewaydApiKey;

var config = require(__dirname + "/../config/config.js");
var coindaemon = require("node-dogecoin")();
coindaemon.set("user", config.get("bitcoind").user);
coindaemon.set("password", config.get("bitcoind").pass);
coindaemon.auth(config.get("bitcoind").user, config.get("bitcoind").pass);


loopAndProcessWithdrawal = function(callback) {
  return async.waterfall([
    function(next) {
      return getWithdrawal(next);
    },
    function(withdrawal, next) {
      return getWithdrawalAddress(withdrawal.external_account_id, function(error, externalAccount) {
        if (error) {
          console.log("getWithdrawalAddress::error", error);
          return next(error, null);
        } else {
          console.log("getWithdrawalAddress::address", externalAccount);
          return next(null, withdrawal, externalAccount);
        }
      });
    },
    function(withdrawal, externalAccount, next) {
      var withdrawaldata = {
        amount: withdrawal.amount,
        address: externalAccount.uid
      };
      return sendCoins(withdrawaldata, function(error, response) {
        return next(error, withdrawal);
      });
    },
    function(withdrawal, next) {
      return clearWithdrawal(withdrawal, next);
    }
  ],
  function(error, clearedWithdrawal) {
    return setTimeout((function() {
      return callback(callback);
    }), 2000);
  });
};

getWithdrawal = function(callback) {
  return request.get(gatewaydDomain + "/v1/withdrawals").auth(gatewaydApiAdmin, gatewaydApiKey).end(function(error, response) {
    var withdrawal;
    if (error) {
      return callback(error, null);
    }
    else {
      withdrawal = response.body.withdrawals[0];
      if (withdrawal) {
        return callback(null, withdrawal);
      }
      else {
        return callback("no withdrawals", null);
      }
    }
  });
};

getWithdrawalAddress = function(externalAccountId, callback) {
  return request.get(gatewaydDomain + "/v1/external_accounts/" + externalAccountId).auth(gatewaydApiAdmin, gatewaydApiKey).end(function(error, response) {
    if (error) {
      return callback(error, null);
    }
    else {
      console.log("getWithdrawalAddress::response", response.body);
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
    return callback(error, transaction.address, options.withdrawal);
  }); 
};

clearWithdrawal = function(withdrawal, callback) {
  var url;
  url = gatewaydDomain + "/v1/withdrawals/" + withdrawal.id + "/clear";
  console.log("clearWithdrawal", url);
  return request.post(url).auth(gatewaydApiAdmin, gatewaydApiKey).send({}).end(function(error, response) {
    console.log("withdrawal::clear::success", response.body);
    console.log("withdrawal::clear::error", response.error);
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

loopAndProcessWithdrawal(loopAndProcessWithdrawal);

var config = require("nconf");

config
  .argv()
  .env()
  .file({ file: __dirname+"/config.json" });

nconf.defaults({
  "environment": "development",

  "gatewayd" : {
    "domain": "192.168.37.37",
    "apiAdmin": "",
    "apiKey": "qoral",
  },

  "bitcoindLastBlockHash": "",
  "bitcoind" : {
    "host": "192.168.37.37",
    "port": 18332,
    "user": "bitcoindrpc",
    "pass": "scQja82SdSNEC6GWbAjaUDHfHFnbbjpW2rPaNzT",
    "confirmations": 3,
    "type": "bitcoin",

    "acronym": "BTC"
  },
});


module.exports = config;
  

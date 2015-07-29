const BlockchainPoller = require(__dirname+'/../lib/blockchain_poller.js');
const BlockchainClient = require(__dirname+'/../lib/blockchain_client.js');
const config = require(__dirname+'/../config/config.js');

blockchainPoller = new BlockchainPoller({
  bitcoindLastBlockHash: config.get('bitcoindLastBlockHash'),
  blockchainClient:  new BlockchainClient()
});

blockchainPoller.pollForBlocks(function(block, next) {
  console.log('FOUND '+block.length+ ' transactions');
  console.log('block', block);
  config.set('bitcoindLastBlockHash', block[0].blockhash);
  config.save(function() {
    next(block[0].blockhash);
  });
});


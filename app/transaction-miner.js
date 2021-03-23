class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  mineTransactions() {
    // get the transaction pools valid transactions
    // generate the miner's reward
    // add a block consisisting of these transactions to the blockchain
    // broadcast the updated blockchain
    // clear the transaction pool
  }
}

module.exports = TransactionMiner;

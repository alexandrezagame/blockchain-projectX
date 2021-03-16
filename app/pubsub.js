// const PubNub = require('pubnub');

// const credentials = {
//   publishKey: 'pub-c-2596ca7e-f13f-43be-8074-088f1bbba279',
//   subscribeKey: 'sub-c-425e8d9e-8264-11eb-99bb-ce4b510ebf19',
//   secretKey: 'sec-c-YzZjMWVmMzMtNGJmMy00MTJjLThkZGUtYjVhOGM0N2YwMTI5',
// };

// const CHANNELS = {
//   TEST: 'TEST',
// };

// class PubSub {
//   constructor() {
//     this.pubnub = new PubNub(credentials);

//     this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });

//     this.pubnub.addListener(this.listener());
//   }

//   listener() {
//     return {
//       message: (messageObject) => {
//         const { channel, message } = messageObject;
//         console.log(
//           `Message received. Channel: ${channel}. Message: ${message}`
//         );
//       },
//     };
//   }

//   publish({ channel, message }) {
//     this.pubnub.publish({ channel, message });
//   }
// }

// module.exports = PubSub;

const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};

class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();

    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage);
        break;
      case CHANNELS.TRANSACTION:
        if (
          !this.transactionPool.existingTransaction({
            inputAddress: this.wallet.publicKey,
          })
        ) {
          this.transactionPool.setTransaction(parsedMessage);
        }
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;

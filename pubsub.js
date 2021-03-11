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
};

class PubSub {
  constructor({ blockchain }) {
    this.blockchain = blockchain;

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

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
}

module.exports = PubSub;

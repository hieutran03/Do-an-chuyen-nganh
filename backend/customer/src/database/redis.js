const redis = require('redis');
const { promisify } = require('util');
//redis
// password: 'mG9KxNxg0XjT3sJefZdxWcMTkaplu7Ui',
//     socket: {
//       host: 'redis-11965.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com',
//       port: "11965"
//     },
const client = redis.createClient(
  {
    legacyMode: true,
  }
);
client.connect().catch(console.error)
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports.getAsync = getAsync;
module.exports.setAsync = setAsync;
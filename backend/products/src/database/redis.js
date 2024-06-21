const redis = require('redis');
const { promisify } = require('util');
//redis
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
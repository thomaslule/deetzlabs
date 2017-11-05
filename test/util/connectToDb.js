const { MongoClient } = require('mongodb');
const config = require('config');

module.exports = () => MongoClient.connect(config.get('db_url'), {});

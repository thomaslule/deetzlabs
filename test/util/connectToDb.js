const { Pool } = require('pg');
const config = require('config');

module.exports = () => Promise.resolve(new Pool({ connectionString: config.get('db_url') }));

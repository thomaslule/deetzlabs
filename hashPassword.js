// call this script: node ./hashPassword.js myP4ssw0rd
const crypto = require('crypto');

process.stdout.write(crypto.createHash('sha256').update(process.argv[2]).digest('base64'));

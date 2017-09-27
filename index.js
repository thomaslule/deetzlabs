const express = require('express');
const request = require('request');

const app = express();

app.use(express.static('public'));

app.post('/test', (req, res) => {
  request({
    uri: 'http://localhost:3101/achievement',
    method: 'POST',
    json: {
      achievement: 'Testeuse',
      username: 'Berzingator2000',
      text: '%USER% bidouille des trucs',
    },
  }, (error) => {
    if (!error) {
      res.sendStatus(200);
    } else {
      console.error(error);
      res.status(500).send(`${error.name}: ${error.message}`);
    }
  });
});

app.listen(3100, () => {
  console.log('listening on *:3100');
});

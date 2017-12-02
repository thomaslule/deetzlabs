# deetzlabs
A back-end system used to trigger various things (like on-screen achievements or chat messages) when other various things (like chat messages or subscribes) happen on a twitch stream.

Best used in combination with [deetzlabs-twitch](https://github.com/thomaslule/deetzlabs-twitch), [deetzlabs-widgets](https://github.com/thomaslule/deetzlabs-widgets) and [deetzlabs-web](https://github.com/thomaslule/deetzlabs-web).

## prerequisites
 * A postgresl database
 * A reverse proxy with an authentication layer (the server will only listen to localhost)

## install
```bash
git clone https://github.com/thomaslule/deetzlabs.git
cp config/default.json config/production.js # customize config here
npm install
npm start
```

## use
Incoming events like chat messages, subscription or cheers are received on an http interface. Following the coded rules, outgoing events like sending a chat message or displaying an achievement on screen will be sent via http.

Achievements are coded in `achievements.js` and chat commands are coded in `commands.js`.

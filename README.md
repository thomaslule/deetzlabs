# deetzlabs
Add viewer achievements and credits to a twitch stream.

# usage
```javascript
const Deetzlabs = require('deetzlabs').default;

const deetzlabs = Deetzlabs(options);

deetzlabs.start()
  .then(() => { console.log('ready!'); });
```

To start with a project already pre-configured clone the [boilerplate repository](https://github.com/thomaslule/deetzlabs-boilerplate).

To get the list of available config options see [this file](https://github.com/thomaslule/deetzlabs/blob/master/src/index.js).

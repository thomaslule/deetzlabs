const { eventsTypes } = require('./viewer/events');
const isCommand = require('./util/isCommand');

const messageCounter = (numberToReach, condition) =>
  (state = { deserved: false, count: 0 }, event) => {
    if (event.type === eventsTypes.sentChatMessage && condition(event.message)) {
      return {
        count: state.count + 1,
        deserved: state.count + 1 >= numberToReach,
      };
    }
    return state;
  };

const nopeReducer = () => ({ deserved: false });

module.exports = {
  testing: {
    name: 'Testeuse',
    text: '%USER% bidouille des trucs',
    reducer: nopeReducer,
  },
  gravedigger: {
    name: 'Fossoyeuse',
    text: '%USER% est un peu sadique...',
    reducer: messageCounter(5, message => isCommand('!rip', message)),
  },
  entertainer: {
    name: 'Ambianceuse',
    text: 'Bim plein de messages dans le chat, gg %USER%',
    reducer: messageCounter(300, () => true),
  },
  swedish: {
    name: 'Suédois LV1',
    text: 'Hej %USER% !',
    reducer: messageCounter(1, message => isCommand('hej', message)),
  },
  cheerleader: {
    name: 'Pom-pom girl',
    text: 'Merci pour tes encouragements %USER% !',
    reducer: messageCounter(5, message => isCommand('!gg', message)),
  },
  berzingue: {
    name: 'Berzingos',
    text: '%USER% dépasse le mur du son !',
    reducer: messageCounter(5, message => isCommand('!berzingue', message)),
  },
  careful: {
    name: 'Prudente',
    text: '%USER% nous montre la voie de la sagesse',
    reducer: messageCounter(5, message => isCommand('!heal', message) || isCommand('!save', message)),
  },
  vigilante: {
    name: 'Vigilance constante',
    text: '%USER% ne laisse rien passer !',
    reducer: messageCounter(5, message => isCommand('!putain', message)),
  },
  benefactor: {
    name: 'Mécène',
    text: 'Cool ! Merci pour ton soutien %USER%',
    reducer: (state = { deserved: false }, event) => {
      if (event.type === eventsTypes.subscribed || event.type === eventsTypes.cheered) {
        return { deserved: true };
      }
      return state;
    },
  },
  hallowinneuse: {
    name: 'Hallowinneuse',
    text: '%USER% a l\'oreille absolue !',
    reducer: nopeReducer,
  },
  despacitrouille: {
    name: 'Hallowinneuse',
    text: '%USER% connaît ses classiques !',
    reducer: nopeReducer,
  },
  herculepoirette: {
    name: 'Hallowinneuse',
    text: '%USER% mène l\'enquête !',
    reducer: nopeReducer,
  },
};

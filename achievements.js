const { eventsTypes } = require('./viewer/events');
const isCommand = require('./util/isCommand');

const messageCounter = (numberToReach, condition, achievement) =>
  (state = { deserved: false, count: 0 }, event) => {
    if (event.type === eventsTypes.sentChatMessage && condition(event.message)) {
      return {
        count: state.count + 1,
        deserved: state.count + 1 >= numberToReach,
      };
    }
    if (event.type === eventsTypes.migratedData) {
      return {
        count: state.count + event[achievement],
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
    reducer: messageCounter(5, message => isCommand('!rip', message), 'gravedigger'),
  },
  entertainer: {
    name: 'Ambianceuse',
    text: 'Bim plein de messages dans le chat, gg %USER%',
    reducer: messageCounter(300, () => true, 'entertainer'),
  },
  swedish: {
    name: 'Suédois LV1',
    text: 'Hej %USER% !',
    reducer: messageCounter(1, message => isCommand('hej', message), 'swedish'),
  },
  cheerleader: {
    name: 'Pom-pom girl',
    text: 'Merci pour tes encouragements %USER% !',
    reducer: messageCounter(5, message => isCommand('!gg', message), 'cheerleader'),
  },
  berzingue: {
    name: 'Berzingos',
    text: '%USER% dépasse le mur du son !',
    reducer: messageCounter(5, message => isCommand('!berzingue', message), 'berzingue'),
  },
  careful: {
    name: 'Prudente',
    text: '%USER% nous montre la voie de la sagesse',
    reducer: messageCounter(5, message => isCommand('!heal', message) || isCommand('!save', message), 'careful'),
  },
  vigilante: {
    name: 'Vigilance constante',
    text: '%USER% ne laisse rien passer !',
    reducer: messageCounter(5, message => isCommand('!putain', message), 'vigilante'),
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
    name: 'Despacitrouille',
    text: '%USER% connaît ses classiques !',
    reducer: nopeReducer,
  },
  hercule_poirette: {
    name: 'Hercule Poirette',
    text: '%USER% mène l\'enquête !',
    reducer: nopeReducer,
  },
};

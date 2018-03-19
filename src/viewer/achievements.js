const viewerEvents = require('./events').eventsTypes;
const { isCommand } = require('../util');

const ONE_HUNDRED_DAYS = 100 * 24 * 60 * 60 * 1000;

const isViewerEvent = event => event.aggregate === 'viewer';

const messageCounter = (numberToReach, condition, achievement) =>
  (state = { distribute: false, count: 0 }, event) => {
    if (isViewerEvent(event)
      && event.type === viewerEvents.sentChatMessage
      && condition(event.message)) {
      return {
        count: state.count + 1,
        distribute: state.count + 1 >= numberToReach,
      };
    }
    if (isViewerEvent(event) && event.type === viewerEvents.migratedData && event[achievement]) {
      return {
        count: state.count + event[achievement],
        distribute: false,
      };
    }
    return {
      ...state,
      distribute: false,
    };
  };

const nopeReducer = () => ({ distribute: false });

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
    text: '%USER% ne laisse rien passer !',
    reducer: messageCounter(5, message => isCommand('!putain', message), 'vigilante'),
  },
  pyromaniac: {
    name: 'Pyromane',
    text: '%USER% allume le feu',
    reducer: messageCounter(5, message => isCommand('!fire', message), 'pyromaniac'),
  },
  benefactor: {
    name: 'Mécène',
    text: 'Cool ! Merci pour ton soutien %USER%',
    reducer: (state, event) => {
      if (isViewerEvent(event) && (
        event.type === viewerEvents.subscribed
        || event.type === viewerEvents.cheered
        || event.type === viewerEvents.donated)) {
        return { distribute: true };
      }
      return { distribute: false };
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
  host: {
    name: 'Hospitalière',
    text: '%USER% nous accueille sur sa chaîne !',
    reducer: (state, event) => {
      if (isViewerEvent(event) && event.type === viewerEvents.hosted) {
        return { distribute: true };
      }
      return { distribute: false };
    },
  },
  elder: {
    name: 'Doyenne',
    text: 'Bienvenue parmi les anciennes, %USER%',
    reducer: (state = { distribute: false, oldestMessage: null }, event) => {
      if (!state.oldestMessage && isViewerEvent(event)
        && event.type === viewerEvents.sentChatMessage) {
        return {
          distribute: false,
          oldestMessage: event.insertDate,
        };
      }
      if (isViewerEvent(event) && event.type === viewerEvents.sentChatMessage
        && (new Date(event.insertDate) - new Date(state.oldestMessage) > ONE_HUNDRED_DAYS)) {
        return {
          ...state,
          distribute: true,
        };
      }
      return {
        ...state,
        distribute: false,
      };
    },
  },
};

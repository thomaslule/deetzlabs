const isCommand = require('./util/isCommand');
const achievements = require('./achievements');

module.exports = (displayNames, viewersAchievements) => [
  {
    condition: message => message.trim().toLowerCase() === '!commands',
    messageToSend: () => 'Moi j\'ai qu\'une commande c\'est !succès',
  },
  {
    condition: message => isCommand('!succès', message) || isCommand('!succes', message) || isCommand('!success', message),
    messageToSend: (viewer) => {
      const displayName = displayNames.get(viewer);
      const viewerAchievements = viewersAchievements.getForViewer(viewer);
      return viewerAchievements.length > 0 ?
        `Bravo ${displayName} pour tes succès : ${viewerAchievements.map(a => achievements[a].name).join(', ')} !`
        : `${displayName} n'a pas encore de succès, déso.`;
    },
  },
];

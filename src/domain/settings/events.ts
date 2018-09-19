export const eventsTypes = {
  achievementVolumeChanged: "achievement-volume-changed",
  followersGoalChanged: "followers-goal-changed",
};

const createEvent = (type: string, content = {}) => ({
  version: 1,
  type,
  ...content,
});

export const achievementVolumeChanged = (volume: number) =>
  createEvent(eventsTypes.achievementVolumeChanged, { volume });

export const followersGoalChanged = (settings: any) =>
  createEvent(eventsTypes.followersGoalChanged, { settings });

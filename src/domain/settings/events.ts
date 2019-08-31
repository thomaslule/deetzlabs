const createEvent = (type: string, content = {}) => ({
  version: 1,
  type,
  date: new Date().toISOString(),
  ...content
});

export const muted = () => createEvent("muted");

export const unmuted = () => createEvent("unmuted");

export const achievementVolumeChanged = (volume: number) =>
  createEvent("achievement-volume-changed", { volume });

export const followersGoalChanged = (settings: any) =>
  createEvent("followers-goal-changed", { settings });

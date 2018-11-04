import { Event } from "es-objects";
import { Options } from "../get-options";
import { Query } from "./query/query";

type ShowAchievementFunc = (name: string, displayName: string, text: string, volume: number) => void;

export function displayAchievementListener(query: Query, showAchievement: ShowAchievementFunc, options: Options) {
  return async (event: Event) => {
    if (event.aggregate === "viewer" &&
      (event.type === "got-achievement" || event.type === "replayed-achievement")) {
      const achievement = options.achievements[event.achievement];
      const viewer = await query.getViewer(event.id);
      if (viewer === undefined) { throw new Error(`could not find viewer ${event.id}`); }
      const volume = (await query.getSettings()).achievementVolume;
      showAchievement(achievement.name, viewer.name, achievement.text, volume);
    }
  };
}

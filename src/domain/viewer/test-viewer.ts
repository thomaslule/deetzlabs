import { getInitialState } from "es-objects";
import { Options } from "../../options";
import { getDecisionReducer, Viewer } from "./viewer";

export class TestViewer extends Viewer {
  constructor(options: Options) {
    const initialDecision = {
      decision: getInitialState(getDecisionReducer(options)),
      sequence: -1
    };
    const publish = () => Promise.resolve();
    super("123", initialDecision, publish, options);
  }

  public currentAchievements() {
    return this.getDecision().achievementsReceived;
  }

  public hasAchievement(achievement: string) {
    return this.getDecision().achievementsReceived.includes(achievement);
  }

  public async handleCustomEvent(eventData: any) {
    const event = await this.publishAndApply(eventData);
    await this.distributeAchievements(event);
  }
}

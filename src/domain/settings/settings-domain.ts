import {
  DecisionProvider, DecisionSequence, EventBus, Projection, Store, ValueStorage,
} from "es-objects";
import { AchievementVolumeProj } from "./achievement-volume-proj";
import { FollowersGoal, FollowersGoalProj } from "./followers-goal-proj";
import { Settings } from "./settings";

export class SettingsDomain {
  private store: Store<Settings, undefined>;
  private achievementVolumeProj: AchievementVolumeProj;
  private followersGoalProj: FollowersGoalProj;

  constructor(
    eventBus: EventBus,
    achievementVolumeProjStorage: ValueStorage<any>,
    followersGoalProjStorage: ValueStorage<any>,
  ) {
    this.store = new Store<Settings, undefined>("settings", Settings, new VoidDecisionProvider(), eventBus);
    this.achievementVolumeProj = new AchievementVolumeProj(achievementVolumeProjStorage);
    this.followersGoalProj = new FollowersGoalProj(followersGoalProjStorage);
    eventBus.onEvent((e) => {
      this.achievementVolumeProj.handleEvent(e).catch((err) => { /* TODO */ });
      this.followersGoalProj.handleEvent(e).catch((err) => { /* TODO */ });
    });
  }

  public async get(): Promise<Settings> {
    return this.store.get("settings");
  }

  public async getAchievementVolume(): Promise<number> {
    return this.achievementVolumeProj.getState();
  }

  public async getFollowersGoal(): Promise<FollowersGoal> {
    return this.followersGoalProj.getState();
  }
}

class VoidDecisionProvider implements DecisionProvider<undefined> {
  public async getDecisionProjection(): Promise<Projection<DecisionSequence<undefined>>> {
    return new Projection<DecisionSequence<undefined>>(() => ({ decision: undefined, sequence: 0 }));
  }
}

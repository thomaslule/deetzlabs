import {
  DecisionProvider, DecisionSequence, EventBus, InMemoryReduceProjection, Store,
} from "es-objects";
import { Readable } from "stream";
import { PgStorage } from "../../storage/pg-storage";
import { AchievementVolumeProj } from "./achievement-volume-proj";
import { FollowersGoal, FollowersGoalProj } from "./followers-goal-proj";
import { Settings } from "./settings";

export class SettingsDomain {
  private store: Store<Settings, undefined>;
  private achievementVolumeProj: AchievementVolumeProj;
  private followersGoalProj: FollowersGoalProj;

  constructor(
    eventBus: EventBus,
    storage: PgStorage,
  ) {
    this.store = new Store<Settings, undefined>(
      "settings",
      (id, decisionState, createAndPublish) => new Settings(createAndPublish),
      new VoidDecisionProvider(),
      (event) => eventBus.publish(event),
    );

    this.achievementVolumeProj = new AchievementVolumeProj(storage.getValueStorage("settings-volume"));
    eventBus.onEvent((event) => this.achievementVolumeProj.handleEvent(event));

    this.followersGoalProj = new FollowersGoalProj(storage.getValueStorage("settings-followers-goal"));
    eventBus.onEvent((event) => this.followersGoalProj.handleEvent(event));
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

  public async rebuild(events: Readable) {
    await Promise.all([
      this.achievementVolumeProj.rebuild(events),
      this.followersGoalProj.rebuild(events),
    ]);
  }
}

class VoidDecisionProvider implements DecisionProvider<undefined> {
  public async getDecisionProjection(): Promise<InMemoryReduceProjection<DecisionSequence<undefined>>> {
    return new InMemoryReduceProjection<DecisionSequence<undefined>>(() => ({ decision: undefined, sequence: 0 }));
  }
}

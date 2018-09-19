import { Entity, Reducer } from "es-objects";
import { donated, eventsTypes, sentChatMessage } from "./events";

export class Viewer extends Entity<DecisionState> {
  public async chatMessage(message: string, displayName: string, options: any) {
    const characteristics: any = {};
    if (options.commands_command.isCommand(message)) {
      characteristics.commandsCommand = true;
    }
    await this.publishAndApply(sentChatMessage(characteristics, displayName));
  }

  public async donate(amount: number) {
    await this.publishAndApply(donated(amount));
  }
}

export interface DecisionState {
  achievementsReceived: string[];
}

export const decisionReducer: Reducer<DecisionState> = (state = { achievementsReceived: [] }, event) => {
  if (event.type === eventsTypes.gotAchievement) {
    return {
      ...state,
      achievementsReceived: state.achievementsReceived.concat(event.achievement),
    };
  }
  return state;
};

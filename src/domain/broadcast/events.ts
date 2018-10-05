import { Obj } from "../../util";

const createEvent = (type: string, content: Obj) => ({
  version: 1,
  type,
  ...content,
});

export function begun(game: string) {
  return createEvent("begun", { game });
}

export function changedGame(game: string) {
  return createEvent("changed-game", { game });
}

export function ended() {
  return createEvent("ended", {});
}

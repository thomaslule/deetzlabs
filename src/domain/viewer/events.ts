import { Obj } from "../../util";

export const eventsTypes = {
  migratedData: "migrated-data",
  sentChatMessage: "sent-chat-message",
  gotAchievement: "got-achievement",
  replayedAchievement: "replayed-achievement",
  subscribed: "subscribed",
  resubscribed: "resubscribed",
  gaveSub: "gave-sub",
  cheered: "cheered",
  donated: "donated",
  joined: "joined",
  left: "left",
  hosted: "hosted",
  raided: "raided",
  followed: "followed",
  becameTopClipper: "became-top-clipper",
  lostTopClipper: "lost-top-clipper",
};

const createEvent = (type: string, content: any = {}) => ({
  version: 1,
  type,
  date: new Date().toISOString(),
  ...content,
});

export const changedName = (name: string) =>
  createEvent("changed-name", { name });

export const sentChatMessage = (message: Obj, broadcastNo?: number) =>
  createEvent(eventsTypes.sentChatMessage, { message, broadcastNo });

export const gotAchievement = (achievement: string) =>
  createEvent(eventsTypes.gotAchievement, { achievement });

export const replayedAchievement = (achievement: string) =>
  createEvent(eventsTypes.replayedAchievement, { achievement });

export const subscribed = () => createEvent(eventsTypes.subscribed);

export const resubscribed = (months: number) => createEvent(eventsTypes.resubscribed, { months });

export const gaveSub = (recipient: string) => createEvent(eventsTypes.gaveSub, { recipient });

export const cheered = (amount: number) => createEvent(eventsTypes.cheered, { amount });

export const donated = (amount: number) => createEvent(eventsTypes.donated, { amount });

export const hosted = (nbViewers: number) => createEvent(eventsTypes.hosted, { nbViewers });

export const raided = (nbViewers: number) => createEvent(eventsTypes.raided, { nbViewers });

export const followed = () => createEvent(eventsTypes.followed);

export const becameTopClipper = () => createEvent(eventsTypes.becameTopClipper);

export const lostTopClipper = () => createEvent(eventsTypes.lostTopClipper);

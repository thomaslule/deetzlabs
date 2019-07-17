import { Obj } from "../../util";

const createEvent = (type: string, content: any = {}) => ({
  version: 1,
  type,
  date: new Date().toISOString(),
  ...content
});

export const changedName = (name: string) =>
  createEvent("changed-name", { name });

export const sentChatMessage = (message: Obj, broadcastNo?: number) =>
  createEvent("sent-chat-message", { message, broadcastNo });

export const gotAchievement = (achievement: string) =>
  createEvent("got-achievement", { achievement });

export const replayedAchievement = (achievement: string) =>
  createEvent("replayed-achievement", { achievement });

export const subscribed = (plan: string) =>
  createEvent("subscribed", { version: 3, plan });

export const resubscribed = (months: number, plan: string) =>
  createEvent("resubscribed", { version: 3, months, plan });

export const gaveSub = (recipient: string, plan: string) =>
  createEvent("gave-sub", { version: 3, recipient, plan });

export const cheered = (amount: number) => createEvent("cheered", { amount });

export const donated = (amount: number, message?: string) =>
  createEvent("donated", { amount, message });

export const hosted = (nbViewers: number) =>
  createEvent("hosted", { nbViewers });

export const raided = (nbViewers: number) =>
  createEvent("raided", { nbViewers });

export const followed = () => createEvent("followed");

export const gotBan = () => createEvent("got-ban");

export const becameTopClipper = () => createEvent("became-top-clipper");

export const lostTopClipper = () => createEvent("lost-top-clipper");

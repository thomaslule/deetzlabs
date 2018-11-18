import { Obj } from "../../util";

const createEvent = (type: string, content: any = {}) => ({
  version: 1,
  type,
  date: new Date().toISOString(),
  ...content,
});

export const changedName = (name: string) =>
  createEvent("changed-name", { name });

export const sentChatMessage = (message: Obj, broadcastNo?: number) =>
  createEvent("sent-chat-message", { message, broadcastNo });

export const gotAchievement = (achievement: string) =>
  createEvent("got-achievement", { achievement });

export const replayedAchievement = (achievement: string) =>
  createEvent("replayed-achievement", { achievement });

export const subscribed = () => createEvent("subscribed");

export const resubscribed = (months: number) => createEvent("resubscribed", { months });

export const gaveSub = (recipient: string) => createEvent("gave-sub", { recipient });

export const cheered = (amount: number) => createEvent("cheered", { amount });

export const donated = (amount: number, message?: string) => createEvent("donated", { amount, message });

export const hosted = (nbViewers: number) => createEvent("hosted", { nbViewers });

export const raided = (nbViewers: number) => createEvent("raided", { nbViewers });

export const followed = () => createEvent("followed");

export const becameTopClipper = () => createEvent("became-top-clipper");

export const lostTopClipper = () => createEvent("lost-top-clipper");

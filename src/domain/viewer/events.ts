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

export const subscribed = (months: number, plan: string) =>
  createEvent("subscribed", { version: 3, months, plan });

export const gaveSubs = (
  plan: string,
  number: number,
  total: number | undefined
) => createEvent("gave-subs", { version: 1, plan, number, total });

export const receivedSub = (plan: string, gifter: string | undefined) =>
  createEvent("received-sub", { version: 1, plan, gifter });

export const cheered = (amount: number) => createEvent("cheered", { amount });

export const donated = (amount: number, message?: string) =>
  createEvent("donated", { amount, message });

export const hosted = (nbViewers: number) =>
  createEvent("hosted", { nbViewers });

export const raided = (nbViewers: number) =>
  createEvent("raided", { nbViewers });

export const followed = () => createEvent("followed");

export const gotBan = () => createEvent("got-ban");

export const gotUnban = () => createEvent("got-unban");

export const wasInHypeTrain = (level: number) =>
  createEvent("was-in-hype-train", { level });

export const redeemedReward = (
  rewardId: string,
  rewartTitle: string,
  rewardCost: number,
  message: string | undefined
) =>
  createEvent("redeemed-reward", {
    rewardId,
    rewartTitle,
    rewardCost,
    message,
  });

export const becameTopClipper = () => createEvent("became-top-clipper");

export const lostTopClipper = () => createEvent("lost-top-clipper");

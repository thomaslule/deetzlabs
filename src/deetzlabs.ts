// import { Admin } from "./admin";
// import { Api } from "./api";
import { Domain } from "./domain";
import { getOptions } from "./get-options";
// import { Server } from "./server";
import { Storage } from "./storage";
import { Streamlabs } from "./streamlabs";
import { Twitch } from "./twitch";
import { Widgets } from "./widgets";

export class Deetzlabs {
  constructor(options?: any) {
    const opts = getOptions(options);
    const twitch = new Twitch();
    const streamlabs = new Streamlabs();
    const widgets = new Widgets();
    // const admin = new Admin();
    const domain = new Domain(new Storage(), (msg) => twitch.say(msg), () => widgets.showAchievement(), opts);
    // const api = new Api(domain);
    // const server = new Server(api.getRouter(), widgets.getRouter(), admin.getRouter(), twitch.getRouter());

    twitch.on("chat", async (channel: any, userstate: any, message: string, isSelf: boolean) => {
      try {
        if (isSelf) { return; }
        const viewer = await domain.viewer.get(userstate.username);
        await viewer.chatMessage(message, userstate["display-name"], opts);
      } catch (error) {
        // TODO
      }
    });

    streamlabs.onDonation(async (from: string, amount: number) => {
      try {
        const viewer = await domain.viewer.get(from);
        await viewer.donate(amount);
      } catch (err) {
        // TODO
      }
    });
  }
}

declare module "twitch-js" {
  import { EventEmitter } from "events";

  export class Client extends EventEmitter {
    constructor(options: any);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    getChannels(): string[];
    getOptions(): any;
    getUsername(): string;
    isMod(channel: string, username: string): boolean;
    readyState(): string;
    say(channel: string, message: string): void;
  }
}

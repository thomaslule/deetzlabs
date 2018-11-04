import { Broadcast } from "./broadcast";

describe("Broadcast", () => {
  let publish: jest.Mock;
  let broadcast: Broadcast;

  beforeEach(() => {
    publish = jest.fn().mockImplementation((event) => event);
    broadcast = new Broadcast({ broadcasting: false, game: undefined }, publish);
  });

  test("it should be able to launch broadcast", async () => {
    await broadcast.begin("Tetris");
    expect(publish).toHaveBeenCalledWith({ type: "begun", game: "Tetris", version: 1, date: expect.anything() });
  });

  test("it shouldn't be able to launch broadcast twice", async () => {
    await broadcast.begin("Tetris");
    await expect(broadcast.begin("Tetris")).rejects.toThrow();
  });

  test("it should be able to change game", async () => {
    await broadcast.begin("Tetris");
    await broadcast.changeGame("Zelda");
    expect(publish).toHaveBeenCalledWith({ type: "changed-game", game: "Zelda", version: 1, date: expect.anything() });
  });

  test("it shouldn't be able to change game for a stopped broadcast", async () => {
    await expect(broadcast.changeGame("Zelda")).rejects.toThrow();
  });

  test("it shouldn't be able to change game for the same game", async () => {
    await broadcast.begin("Tetris");
    await expect(broadcast.changeGame("Tetris")).rejects.toThrow();
  });

  test("it should be able to end broadcast", async () => {
    await broadcast.begin("Tetris");
    await broadcast.end();
    expect(publish).toHaveBeenCalledWith({ type: "begun", game: "Tetris", version: 1, date: expect.anything() });
  });

  test("it shouldn't be able to end a stopped broadcast", async () => {
    await expect(broadcast.end()).rejects.toThrow();
  });

});

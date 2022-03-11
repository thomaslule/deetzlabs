const socket = window.io();

let endsAt = new Date();

function queue(fn, delay) {
  const now = new Date();
  if (endsAt < now) endsAt = now;
  setTimeout(() => {
    fn();
  }, endsAt.getTime() - now.getTime());
  endsAt = new Date(endsAt.getTime() + delay);
}

socket.on("achievement", (achievement) => {
  queue(() => window.showAchievement(achievement), 10000);
});

const socket = window.io(window.location.origin, { path: `${window.config.public_server.root_path}/socket.io` });

let endsAt = new Date();

function queue(fn, delay) {
  const now = new Date();
  if (endsAt < now) endsAt = now;
  setTimeout(() => {
    fn();
  }, endsAt.getTime() - now.getTime());
  endsAt = new Date(endsAt.getTime() + delay);
}

socket.on('achievement', (achievement) => {
  queue(() => window.showAchievement(achievement), 10000);
});

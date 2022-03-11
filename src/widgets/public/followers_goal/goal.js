function refreshAmount(amount, goal) {
  document.getElementById("current_amount").textContent = amount;
  document.getElementById("current_bar").style.width = `${Number(
    (100 * amount) / goal
  ).toFixed(2)}%`;
}

function refresh(goal) {
  fetch(
    `https://api.twitch.tv/kraken/channels/${window.config.channel}/follows?limit=1`,
    {
      method: "GET",
      headers: {
        "Client-ID": window.config.client_id,
      },
    }
  )
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject();
    })
    .then((json) => {
      refreshAmount(json._total, goal);
    });
}

fetch("/api/followers_goal")
  .then((res) => res.json())
  .then((json) => {
    document.getElementById("goal_html").innerHTML = json.html;
    document.getElementById("goal_css").innerHTML = json.css;
    document.getElementById("goal").textContent = json.goal;
    refresh(json.goal);
    setInterval(() => refresh(json.goal), 30000);
  });

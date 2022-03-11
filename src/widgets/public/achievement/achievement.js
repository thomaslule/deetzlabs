const ding = new Audio("ding.mp3");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showAchievement(achievement) {
  ding.volume = Number(achievement.volume);
  $("#achievement-name").text(achievement.achievement);
  $("#achievement-text").html(
    $(`<div>${achievement.text}</div>`)
      .text()
      .replace("%USER%", `<strong>${achievement.username}</strong>`)
  );
  setTimeout(() => ding.play(), 1000);

  $("#achievement .circle").removeClass("rotate");
  // Run the animations
  setTimeout(() => {
    $("#achievement").addClass("expand");
    setTimeout(() => {
      $("#achievement").addClass("widen");
      setTimeout(() => {
        $("#achievement .copy").addClass("show");
      }, 1000);
    }, 1000);
  }, 1000);
  // Hide the achievement
  setTimeout(() => {
    hideAchievement();
  }, 4000);
}

function hideAchievement() {
  setTimeout(() => {
    $("#achievement .copy").removeClass("show");
    setTimeout(() => {
      $("#achievement").removeClass("widen");
      $("#achievement .circle").addClass("rotate");
      setTimeout(() => {
        $("#achievement").removeClass("expand");
      }, 1000);
    }, 1000);
  }, 3000);
}

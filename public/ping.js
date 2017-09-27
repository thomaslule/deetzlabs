document.getElementById('test-button').onclick = () => {
  fetch('/test', { method: 'POST' });
};
document.getElementById('assign-button').onclick = () => {
  fetch('/achievement', {
    method: 'POST',
    body: JSON.stringify({
      achievement: 'Truqueuse',
      user: {
        username: 'bidule',
        'display-name': 'Bidule',
      },
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

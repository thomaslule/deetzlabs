document.getElementById('test-button').onclick = () => {
  fetch('test', {
    method: 'POST',
    body: JSON.stringify({
      secret: document.getElementById('password').value,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

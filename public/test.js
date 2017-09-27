document.getElementById('test-button').onclick = () => {
  fetch('/test', { method: 'POST' });
};

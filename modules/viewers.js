module.exports = (persist) => {
  const storeName = 'viewers';

  const get = () => (persist.getItemSync(storeName) || []).sort();

  const receiveMessage = (user) => {
    const stored = get();
    const newStore = stored.filter(n => n.toLowerCase() !== user['display-name'].toLowerCase());
    newStore.push(user['display-name']);
    persist.setItemSync(storeName, newStore);
  };

  const getDisplayName = username =>
    get().find(n => n.toLowerCase() === username.toLowerCase()) || username;

  return { receiveMessage, get, getDisplayName };
};

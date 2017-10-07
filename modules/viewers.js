const viewers = (persist) => {
  const storeName = 'viewers';
  return {
    receiveMessage: (user) => {
      const stored = persist.getItemSync(storeName) || [];
      const newStore = stored.filter(n => n.toLowerCase() !== user['display-name'].toLowerCase());
      newStore.push(user['display-name']);
      persist.setItemSync(storeName, newStore);
    },
    get: () => persist.getItemSync(storeName) || [],
  };
};

module.exports = viewers;

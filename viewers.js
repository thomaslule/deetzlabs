const viewers = (persist) => {
  const storeName = 'viewers';
  return {
    received: (name, callback = () => {}) => {
      const stored = persist.getItemSync(storeName) || [];
      const newStore = stored.filter(n => n.toLowerCase() !== name.toLowerCase());
      newStore.push(name);
      persist.setItemSync(storeName, newStore);
      callback();
    },
    get: () => persist.getItemSync(storeName) || [],
  };
};

module.exports = viewers;

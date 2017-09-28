module.exports = () => {
  const data = {};

  return {
    getItem: key => new Promise(resolve => resolve(data[key])),
    getItemSync: key => data[key],
    setItem: (key, value) => new Promise((resolve) => {
      data[key] = value;
      resolve();
    }),
    setItemSync: (key, value) => {
      data[key] = value;
    },
  };
};

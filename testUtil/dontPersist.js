module.exports = () => {
  const data = {};

  return {
    getItem: key => new Promise(resolve => resolve(data[key])),
    getItemAsync: key => data[key],
    setItem: (key, value) => new Promise((resolve) => {
      data[key] = value;
      resolve();
    }),
    setItemAsync: (key, value) => {
      data[key] = value;
    },
  };
};

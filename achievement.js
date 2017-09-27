module.exports = () => {
  const data = {};
  return {
    received: (achievement, callback) => {
      callback();
    },
    get: (user, callback) => {
      callback(null, []);
    },
  };
};

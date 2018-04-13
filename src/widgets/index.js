module.exports = () => {
  const showAchievement = () => null;
  const getRouter = () => (req, res, next) => { next(); };

  return {
    showAchievement,
    getRouter,
  };
};

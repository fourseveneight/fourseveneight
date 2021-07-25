module.exports = {
  verifyAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(403).json({
      status: 'failed',
      data: {
        message: 'unable to authorize',
      },
    });
  },
};

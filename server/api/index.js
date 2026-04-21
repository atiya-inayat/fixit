let app;
try {
  const mod = require('../dist/index.js');
  app = mod.default || mod;
} catch (err) {
  app = (req, res) => {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  };
}
module.exports = app;

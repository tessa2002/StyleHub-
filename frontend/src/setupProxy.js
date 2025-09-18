// frontend/src/setupProxy.js
// Proxies only API and uploads to backend, avoiding interference with Webpack HMR
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    ['/api', '/uploads'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
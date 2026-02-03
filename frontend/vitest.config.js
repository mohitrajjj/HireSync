const { defineConfig } = require('vite');

module.exports = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './frontend/tests/setupTests.js',
  },
});

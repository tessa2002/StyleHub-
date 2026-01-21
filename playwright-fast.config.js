const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  
  // Faster timeout for quick tests
  timeout: 20 * 1000,
  
  expect: {
    timeout: 3000
  },
  
  // Run tests in parallel for speed
  fullyParallel: true,
  
  // Use all CPU cores
  workers: '100%',
  
  // Retry failed tests once
  retries: 1,
  
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    
    // Faster navigation
    navigationTimeout: 10000,
    actionTimeout: 5000,
    
    // Only trace/screenshot on failure
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Disable slow features for speed
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Faster browser context
        launchOptions: {
          args: ['--disable-dev-shm-usage']
        }
      },
    },
  ],

  // Servers should already be running
  // Comment out to skip server startup
  webServer: [
    {
      command: 'cd backend && npm start',
      url: 'http://localhost:5000',
      timeout: 60 * 1000,
      reuseExistingServer: true, // Don't restart if already running
    },
    {
      command: 'cd frontend && npm start',
      url: 'http://localhost:3000',
      timeout: 60 * 1000,
      reuseExistingServer: true,
    },
  ],
});














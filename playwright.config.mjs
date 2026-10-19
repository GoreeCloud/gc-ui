import {defineConfig,devices} from '@playwright/test';
import {resolvePlaywrightIsolation} from './scripts/playwright-isolation-config.mjs';

const {port,outputDir}=resolvePlaywrightIsolation(process.env);
const local='http://127.0.0.1:'+port;
export default defineConfig({
  testDir:'./e2e',
  outputDir,
  timeout:30000,
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  reporter:process.env.CI?'github':'list',
  use:{
    ...devices['Desktop Chrome'],
    baseURL:local,
    trace:'retain-on-failure',
    screenshot:'only-on-failure'
  },
  webServer:{
    command:'python3 -m http.server '+port+' --bind 127.0.0.1',
    url:local+'/lab/components.html',
    reuseExistingServer:!process.env.CI,
    timeout:30000
  }
});

import {defineConfig,devices} from '@playwright/test';

const port=Number(process.env.GC_PLAYWRIGHT_PORT??4173);
if(!Number.isInteger(port)||port<1024||port>65535)
 throw new TypeError('GC_PLAYWRIGHT_PORT must be a port between 1024 and 65535');
const local='http://127.0.0.1:'+port;
export default defineConfig({
  testDir:'./e2e',
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

/** Local-only, headed browser fixture for isolated Orca/AT-SPI acceptance diagnostics. */
import {chromium} from '@playwright/test';

const port=Number(process.env.GC_UI_AT_PORT);
if(!Number.isInteger(port)||port<1024||port>65535)
 throw new Error('GC_UI_AT_PORT must be a valid local test port');
const base='http://127.0.0.1:'+port;
const browser=await chromium.launch({headless:false,args:['--force-renderer-accessibility']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:850}});
 await page.goto(base+'/lab/components.html');
 const trigger=page.locator('#gc-file-action-trigger');
 await trigger.focus();
 await page.waitForTimeout(2500);
 await trigger.press('ArrowDown');
 await page.getByRole('menuitem',{name:'Duplicate workspace'}).waitFor();
 console.log('PHASE_COMPONENTS_MENU_OPEN');
 await page.waitForTimeout(5000);
 await page.keyboard.press('Escape');
 await page.waitForTimeout(1400);
 await page.goto(base+'/lab/forms.html');
 const input=page.getByRole('combobox',{name:'Search projects'});
 await input.focus();
 await input.fill('d');
 await input.press('ArrowDown');
 await page.getByRole('option',{name:'Studio refresh'}).waitFor();
 console.log('PHASE_FORMS_SUGGESTION_OPEN');
 await page.waitForTimeout(5500);
 await input.press('Escape');
 await page.waitForTimeout(1400);
}finally{
 await browser.close();
}

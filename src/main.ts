import { EventEmitter } from 'events';
import pup from 'puppeteer';
import cookies from '../cookies.json';
import { accounts, Person } from './constants/insta_accounts';
import { requestInterceptionHandler, saveCookies } from './services/insta.service';


const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(11);

async function runInstagramFollowsScrap(person: Person): Promise<void> {
  let cookieUsed = false;
  const browser = await pup.launch({ headless: false, timeout: 0 });

  const page = await browser.newPage();
  await page.setCookie(...cookies as pup.Protocol.Network.CookieParam[])
  cookieUsed = true;

  await page.goto('https://instagram.com');
  if (!cookieUsed) await saveCookies(page, cookieUsed);

  await page.goto('https://www.instagram.com/' + person.username);
  await page.setRequestInterception(true);
  await requestInterceptionHandler(page, person, () => eventEmitter.emit('CloseBrowser'));

  await page.click(`a[href="/${person.username}/followers/"]`);

  eventEmitter.on('CloseBrowser', async () => {
    await browser.close()
  })
};

(async () => {
  for (const user of accounts) {
    try {
      await runInstagramFollowsScrap(user);
    } catch (e) {
      console.log(e.message);
      eventEmitter.emit('CloseBrowser');
    }
  }
})()
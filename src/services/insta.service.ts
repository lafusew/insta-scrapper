import fs from 'fs/promises';
import { Page } from 'puppeteer';
import { Person } from '../constants/insta_accounts';

export async function saveCookies(page: Page, cookieUsed: boolean): Promise<void> {
  if (!cookieUsed) {
    await page.click('.aOOlW.bIiDR');
    await page.waitForSelector('._2hvTZ.pexuQ.zyHYP');

    // Login 
    const inputs = await page.$$('._2hvTZ.pexuQ.zyHYP');
    await inputs[0].type('okokdatadata2');
    await inputs[1].type('123yes123');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
  }

  const cookies = await page.cookies();
  await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
}

export async function requestInterceptionHandler(page: Page, person: Person, emitEventCallBack: () => void): Promise<void> {
  page.on('request', (request) => {
    if (request.resourceType() === 'image') { request.abort(); return; }
    if (request.method() !== 'GET') { request.continue(); return; }
    if (!request.url().startsWith('https://i.instagram.com/api/v1/friendships/')) { request.continue(); return; }

    const urlPaths = request.url().split('/')
    console.log('>>', request.method(), urlPaths[urlPaths.length - 2], person.realName)

    request.continue({
      url: request.url().replace('?count=12', '?count=5000')
    });
  })

  page.on('response', async (response) => {
    if (response.request().method() !== 'GET') return;
    if (!response.url().startsWith('https://i.instagram.com/api/v1/friendships/')) return;

    const { users } = await response.json();
    const urlPaths = response.url().split('/');
    const follow_type = urlPaths[urlPaths.length - 2]

    console.log('<<', follow_type, users.length, person.realName);

    await fs.writeFile(
      `./json/${person.username}._${follow_type}_.json`,
      JSON.stringify({ type: follow_type, users }, null, 2)
    )

    emitEventCallBack();
  })
}


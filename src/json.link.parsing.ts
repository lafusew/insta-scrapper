import { opendir, readFile, writeFile } from 'fs/promises';
import { Node } from './json.node.parsing';
interface Link {
  source: string,
  target: string,
}

let nodes: Node[];
const links: Link[] = [];

async function ls(path) {
  nodes = JSON.parse(await readFile('./results/___nodes.json', { encoding: 'utf-8' }));
  const dir = await opendir(path)
  for await (const dirent of dir) {
    const splitedFileName = dirent.name.split('.');
    if (splitedFileName[splitedFileName.length - 2] !== '_following_') continue;

    const currentUsername = splitedFileName[splitedFileName.length - 3];

    const path = './json/' + dirent.name;
    const obj = JSON.parse(await readFile(path, { encoding: 'utf-8' }));

    for (const { username } of obj.users) {
      if (!nodes.some((node) => node.username === username)) continue;
      links.push({ source: currentUsername, target: username });
    }
  }

  await writeFile(
    `./results/___links.json`,
    JSON.stringify(links, null, 2)
  )
}


ls('json').catch(console.error)
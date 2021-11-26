import { opendir, readFile, writeFile } from 'fs/promises';

export interface Node {
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  followed_by_how_many_of_us: number;
  is_verified: boolean;
  has_anonymous_profile_picture: boolean;
  name: string;
  id: string;
  val: number;
}

const followedByUs: Node[] = [];
let followedByAtLeast2OfUs: Node[];

async function ls(path) {
  const dir = await opendir(path)
  for await (const dirent of dir) {
    const splitedFileName = dirent.name.split('.');
    if (splitedFileName[splitedFileName.length - 2] !== '_following_') continue;

    const path = './json/' + dirent.name;
    const obj = JSON.parse(await readFile(path, { encoding: 'utf-8' }));

    for (const {
      username,
      full_name,
      is_private,
      profile_pic_url,
      is_verified,
      has_anonymous_profile_picture
    } of obj.users) {
      const indexInFollowedByUsList = followedByUs.findIndex((el) => el.username === username);
      if (indexInFollowedByUsList > 0) {
        followedByUs[indexInFollowedByUsList].followed_by_how_many_of_us++;
        followedByUs[indexInFollowedByUsList].val++;
      } else {
        followedByUs.push({
          username,
          full_name,
          is_private,
          profile_pic_url,
          is_verified,
          has_anonymous_profile_picture,
          followed_by_how_many_of_us: 1,
          val: 1,
          id: username,
          name: username
        });
      }
    }
  }
  followedByAtLeast2OfUs = followedByUs.filter((followedAccount) => followedAccount.followed_by_how_many_of_us > 1);
  console.log(followedByAtLeast2OfUs.length);

  await writeFile(
    `./results/___nodes.json`,
    JSON.stringify(
      followedByAtLeast2OfUs.sort((a, b) => b.followed_by_how_many_of_us - a.followed_by_how_many_of_us),
      null,
      2
    )
  )
}


ls('json').catch(console.error)
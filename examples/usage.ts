import 'dotenv/config';
import { Client, SearchParamType, ParamSort, ParamSeq } from '../src';

async function main() {
  const username = process.env.NCORE_USERNAME || '';
  const password = process.env.NCORE_PASSWORD || '';

  if (!username || !password) {
    console.error('Please set NCORE_USRNAME and NCORE_PASSWORD .env');
    process.exit(1);
  }

  const client = new Client(5000);
  await client.login(username, password);

  const result = await client.search(
    'Forrest',
    SearchParamType.HD_HUN,
    undefined,
    ParamSort.SEEDERS,
    ParamSeq.DECREASING
  );

  const first = result.torrents[0];
  if (!first) {
    console.log('No trrents found :(');
    await client.logout();
    return;
  }

  console.log('Found:', first.get('title'), first.get('id'));
  const saved = await client.download(first, '.', true);
  console.log('Saved to:', saved);

  await client.logout();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

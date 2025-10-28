# js-ncoreparser

Node.js client for ncore.pro — search, download, rss feed, etc.

- Original Python lib by [@radaron](https://github.com/radaron/) — big kudos!
- Ported to JS/Node and npm packaging by [@alexgabe-dev](https://github.com/alexgabe-dev)

> Heads-up: this is an unofficial client. Site HTML may change :) I try to keep up but no promises.

## Install

```bash
npm i js-ncoreparser
```

## Quick example

```ts
import { Client, SearchParamType, ParamSort, ParamSeq } from 'js-ncoreparser';

(async () => {
  const client = new Client();
  await client.login('username', 'password');

  const result = await client.search(
    '',
    SearchParamType.HD_HUN,
    undefined,
    ParamSort.SEEDERS,
    ParamSeq.DECREASING,
  );

  console.log(result.torrents[0].get('title'));
  await client.logout();
})();
```

## Environment
- Copy `.env.example` to `.env` and fill in:
  - `NCORE_USERNAME`
  - `NCORE_PASSWORD`
  - `RSS_URL`
- If you want to load from `.env` in your app, `npm i dotenv` and call:
  ```ts
  import 'dotenv/config';
  ```

## API

- `Client.login(username, password)` — creates a sesion (cookies kept internally)
- `Client.search(pattern, type?, where?, sortBy?, sortOrder?, page?)` → `{ torrents, numOfPages }`
- `Client.getTorrent(id, extraParams?)` → `Torrent`
- `Client.getByRss(url)` → `AsyncGenerator<Torrent>`
- `Client.getByActivity()` → `Promise<Torrent[]>`
- `Client.getRecommended(type?)` → `AsyncGenerator<Torrent>`
- `Client.download(torrent, path, override?)` → saves `.torrent` file
- `Client.logout()` — clears cookies, ends sesion

Torrent goodies:
- `torrent.get('title'|'size'|'download'|'url'|...)`

Also exposed enums and helpers: `SearchParamType`, `SearchParamWhere`, `ParamSort`, `ParamSeq`, `Size`, `getTorrentPageUrl`.

## Notes
- HTML parsing uses regex and some assumptions. If it breaks after a site update, plz open an issue.

## License
MIT

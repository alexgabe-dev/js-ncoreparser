import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '../src/client';
import { URLs, ParamSort, ParamSeq, SearchParamType, SearchParamWhere } from '../src/data';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';

function textBody(s: string) {
  return new TextEncoder().encode(s);
}

let mock: MockAgent;
let origin: ReturnType<typeof mock.get>;

beforeEach(() => {
  mock = new MockAgent({ keepAliveTimeout: 10 });
  mock.disableNetConnect();
  setGlobalDispatcher(mock);
  origin = mock.get('https://ncore.pro');
});

afterEach(() => {
  mock.close();
  setGlobalDispatcher(new Agent());
});

describe('Client basic', () => {
  it('login ok redirects to index', async () => {
    origin
      .intercept({ path: '/login.php', method: 'POST' })
      .reply(302, textBody(''), {
        headers: { location: '/index.php', 'set-cookie': 'sid=abc; Path=/' },
      });

    const c = new Client();
    await expect(c.login('u', 'p')).resolves.toBeUndefined();
  });

  it('search builds URL and parses fields', async () => {
    origin
      .intercept({ path: '/login.php', method: 'POST' })
      .reply(302, textBody(''), { headers: { location: '/index.php', 'set-cookie': 'sid=abc; Path=/' } });

    const html = `
      <link rel="alternate" href="/rss.php?key=deadbeef" title="rss"> 
      <a href="/torrents.php?tipus=hd_hun"><img src="x" class="categ_link" alt="x" title="x"></a>
      <a href="x" onclick="torrent(123); return false;" title="Forrest Gump"></a>
      <div class="box_feltoltve2">2020-01-01<br>12:00:00</div>
      <div class="box_meret2">1.00 GiB</div>
      <div class="box_s2"><a class="torrent" href="x">10</a></div>
      <div class="box_l2"><a class="torrent" href="x">2</a></div>
      <span class="active_link"><strong>25</strong></span>
    `;

    origin
      .intercept({ path: /\/torrents\.php.*/, method: 'GET' })
      .reply(200, textBody(html), { headers: { 'set-cookie': 'sid=abc; Path=/' } });

    const c = new Client();
    await c.login('u', 'p');
    const res = await c.search('', SearchParamType.HD_HUN, SearchParamWhere.NAME, ParamSort.SEEDERS, ParamSeq.DECREASING);

    expect(res.numOfPages).toBe(1);
    expect(res.torrents.length).toBe(1);
    const t = res.torrents[0]!;
    expect(t.get('id')).toBe('123');
    expect(String(t.get('size'))).toBe('1.00 GiB');
    expect(t.get('seed')).toBe('10');
    expect(t.get('leech')).toBe('2');
    expect(typeof t.get('download')).toBe('string');
  });
});

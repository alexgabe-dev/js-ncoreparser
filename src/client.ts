import { request } from 'undici';
import path from 'node:path';
import { URLs, SearchParamType, SearchParamWhere, ParamSeq, ParamSort } from './data';
import { TorrentsPageParser, TorrenDetailParser, RssParser, ActivityParser, RecommendedParser } from './parser';
import { Size } from './util';
import { Torrent } from './torrent';
import type { SearchResult } from './types';

export class Client {
  private _cookies: Record<string, string> = {};
  private _loggedIn = false;
  private _pageParser = new TorrentsPageParser();
  private _detailedParser = new TorrenDetailParser();
  private _rssParser = new RssParser();
  private _activityParser = new ActivityParser();
  private _recommendedParser = new RecommendedParser();
  private _userAgent = 'js ncoreparser';
  private _timeout = 1000;

  constructor(timeout: number = 1000) {
    this._timeout = timeout;
  }

  private _ensureLoggedIn() {
    if (!this._loggedIn) throw new Error(`Cannot login to tracker. Please use login function first.`);
  }

  private _headers(extra: Record<string, string> = {}) {
    const cookie = Object.entries(this._cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    return {
      'User-Agent': this._userAgent,
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    } as Record<string, string>;
  }

  private _saveCookies(headers: Record<string, any>) {
    const setCookie = (headers as any)['set-cookie'] as string | string[] | undefined;
    const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    for (const sc of list) {
      const parts = sc.split(';');
      const kv = parts[0];
      if (!kv) continue;
      const [k, v] = kv.split('=');
      if (k && v) this._cookies[k.trim()] = v.trim();
    }
  }

  async login(username: string, password: string): Promise<void> {
    this._cookies = {};
    try {
      const { headers, body, statusCode } = await request(URLs.LOGIN, {
        method: 'POST',
        headers: this._headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        body: new URLSearchParams({ nev: username, pass: password }).toString(),
      });
      this._saveCookies(headers as any);
      const location = (headers as any)['location'] as string | undefined;
      const urlAfter = location ? new URL(location, URLs.LOGIN).toString() : (statusCode === 302 ? location : URLs.INDEX);
      if (urlAfter !== URLs.INDEX) {
        await this.logout();
        throw new Error(`Error while login, check credentials for user: '${username}'`);
      }
      // consume body to free socket
      await new Response(body as any).arrayBuffer().catch(() => {});
      this._loggedIn = true;
    } catch (e: any) {
      throw new Error(`Error while perform post method to url '${URLs.LOGIN}'.`);
    }
  }

  async search(
    pattern: string,
    type: SearchParamType = SearchParamType.ALL_OWN,
    where: SearchParamWhere = SearchParamWhere.NAME,
    sortBy: ParamSort = ParamSort.UPLOAD,
    sortOrder: ParamSeq = ParamSeq.DECREASING,
    page: number = 1
  ): Promise<SearchResult> {
    this._ensureLoggedIn();
    const url = URLs.DOWNLOAD_PATTERN({
      page,
      t_type: type,
      sort: sortBy,
      seq: sortOrder,
      pattern,
      where,
    });
    try {
      const { body, headers } = await request(url, { method: 'GET', headers: this._headers() });
      this._saveCookies(headers as any);
      const text = await new Response(body as any).text();
      const torrents = this._pageParser.getItems(text).map((params: any) => new Torrent(params));
      const numOfPages = this._pageParser.getNumOfPages(text);
      return { torrents, numOfPages };
    } catch (e: any) {
      throw new Error(`Error while searhing torrents. ${e}`);
    }
  }

  async getTorrent(id: string, extParams: Record<string, any> = {}): Promise<Torrent> {
    this._ensureLoggedIn();
    const url = URLs.DETAIL_PATTERN(id);
    try {
      const { body, headers } = await request(url, { method: 'GET', headers: this._headers() });
      this._saveCookies(headers as any);
      const text = await new Response(body as any).text();
      const params = this._detailedParser.getItem(text) as any;
      params.id = id;
      Object.assign(params, extParams);
      return new Torrent(params);
    } catch (e: any) {
      throw new Error(`Error while get detailed page. Url: '${url}'. ${e}`);
    }
  }

  async *getByRss(url: string) {
    this._ensureLoggedIn();
    try {
      const { body, headers } = await request(url, { method: 'GET', headers: this._headers() });
      this._saveCookies(headers as any);
      const text = await new Response(body as any).text();
      const ids = this._rssParser.getIds(text);
      for (const id of ids) {
        yield await this.getTorrent(id);
      }
    } catch (e: any) {
      throw new Error(`Error while get rss. Url: '${url}'. ${e}`);
    }
  }

  async getByActivity(): Promise<Torrent[]> {
    this._ensureLoggedIn();
    try {
      const { body, headers } = await request(URLs.ACTIVITY, { method: 'GET', headers: this._headers() });
      this._saveCookies(headers as any);
      const text = await new Response(body as any).text();
      const torrents: Torrent[] = [];
      for (const [id, start_t, updated_t, status, uploaded, downloaded, remaining_t, rate] of this._activityParser.getParams(
        text
      )) {
        torrents.push(
          await this.getTorrent(id, {
            start: start_t,
            updated: updated_t,
            status,
            uploaded: new Size(uploaded),
            downloaded: new Size(downloaded),
            remaining: remaining_t,
            rate: parseFloat(rate),
          })
        );
      }
      return torrents;
    } catch (e: any) {
      throw new Error(`Error while get activity. Url: '${URLs.ACTIVITY}'. ${e}`);
    }
  }

  async *getRecommended(type?: SearchParamType) {
    this._ensureLoggedIn();
    try {
      const { body, headers } = await request(URLs.RECOMMENDED, { method: 'GET', headers: this._headers() });
      this._saveCookies(headers as any);
      const text = await new Response(body as any).text();
      for (const id of this._recommendedParser.getIds(text)) {
        const torrent = await this.getTorrent(id);
        if (!type || torrent.get('type') === type) {
          yield torrent;
        }
      }
    } catch (e: any) {
      throw new Error(`Error while get recommended. Url: '${URLs.RECOMMENDED}'. ${e}`);
    }
  }

  async download(torrent: Torrent, path: string, override: boolean = false): Promise<string> {
    this._ensureLoggedIn();
    const [filePath, url] = this._prepareDownload(torrent, path);
    try {
      const fs = await import('fs/promises');
      const { body } = await request(url, { method: 'GET', headers: this._headers() });
      const buf = Buffer.from(await new Response(body as any).arrayBuffer());
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (!override && exists) throw new Error(`Error while downloading file: '${filePath}'. It is already exists.`);
      await fs.writeFile(filePath, buf);
      return filePath;
    } catch (e: any) {
      throw new Error(`Error while downloading torrent. Url: '${url}'. ${e}`);
    }
  }

  private _prepareDownload(torrent: Torrent, outDir: string): [string, string] {
    const title = String(torrent.get('title'));
    const filename = title.replace(/\s+/g, '_') + '.torrent';
    const url = String(torrent.get('download'));
    const filePath = path.join(outDir, filename);
    return [filePath, url];
  }

  async logout(): Promise<void> {
    this._cookies = {};
    this._loggedIn = false;
  }
}

import { request } from 'undici';
import { URLs, SearchParamType, SearchParamWhere, ParamSeq, ParamSort } from './data';
import { TorrentsPageParser, TorrenDetailParser, RssParser, ActivityParser, RecommendedParser } from './parser';
import { Size } from './util';
import { Torrent } from './torrent';
export class Client {
    _cookies = {};
    _loggedIn = false;
    _pageParser = new TorrentsPageParser();
    _detailedParser = new TorrenDetailParser();
    _rssParser = new RssParser();
    _activityParser = new ActivityParser();
    _recommendedParser = new RecommendedParser();
    _userAgent = 'js ncoreparser';
    _timeout = 1000;
    constructor(timeout = 1000) {
        this._timeout = timeout;
    }
    _ensureLoggedIn() {
        if (!this._loggedIn)
            throw new Error(`Cannot login to tracker. Please use login function first.`);
    }
    _headers(extra = {}) {
        const cookie = Object.entries(this._cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');
        return {
            'User-Agent': this._userAgent,
            ...(cookie ? { Cookie: cookie } : {}),
            ...extra,
        };
    }
    _saveCookies(headers) {
        const setCookie = headers['set-cookie'];
        const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
        for (const sc of list) {
            const parts = sc.split(';');
            const kv = parts[0];
            if (!kv)
                continue;
            const [k, v] = kv.split('=');
            if (k && v)
                this._cookies[k.trim()] = v.trim();
        }
    }
    async login(username, password) {
        this._cookies = {};
        try {
            const { headers, body, statusCode } = await request(URLs.LOGIN, {
                method: 'POST',
                headers: this._headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
                body: new URLSearchParams({ nev: username, pass: password }).toString(),
            });
            this._saveCookies(headers);
            const location = headers['location'];
            const urlAfter = location ? new URL(location, URLs.LOGIN).toString() : (statusCode === 302 ? location : URLs.INDEX);
            if (urlAfter !== URLs.INDEX) {
                await this.logout();
                throw new Error(`Error while login, check credentials for user: '${username}'`);
            }
            // consume body to free socket
            await new Response(body).arrayBuffer().catch(() => { });
            this._loggedIn = true;
        }
        catch (e) {
            throw new Error(`Error while perform post method to url '${URLs.LOGIN}'.`);
        }
    }
    async search(pattern, type = SearchParamType.ALL_OWN, where = SearchParamWhere.NAME, sortBy = ParamSort.UPLOAD, sortOrder = ParamSeq.DECREASING, page = 1) {
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
            this._saveCookies(headers);
            const text = await new Response(body).text();
            const torrents = this._pageParser.getItems(text).map((params) => new Torrent(params));
            const numOfPages = this._pageParser.getNumOfPages(text);
            return { torrents, numOfPages };
        }
        catch (e) {
            throw new Error(`Error while searhing torrents. ${e}`);
        }
    }
    async getTorrent(id, extParams = {}) {
        this._ensureLoggedIn();
        const url = URLs.DETAIL_PATTERN(id);
        try {
            const { body, headers } = await request(url, { method: 'GET', headers: this._headers() });
            this._saveCookies(headers);
            const text = await new Response(body).text();
            const params = this._detailedParser.getItem(text);
            params.id = id;
            Object.assign(params, extParams);
            return new Torrent(params);
        }
        catch (e) {
            throw new Error(`Error while get detailed page. Url: '${url}'. ${e}`);
        }
    }
    async *getByRss(url) {
        this._ensureLoggedIn();
        try {
            const { body, headers } = await request(url, { method: 'GET', headers: this._headers() });
            this._saveCookies(headers);
            const text = await new Response(body).text();
            const ids = this._rssParser.getIds(text);
            for (const id of ids) {
                yield await this.getTorrent(id);
            }
        }
        catch (e) {
            throw new Error(`Error while get rss. Url: '${url}'. ${e}`);
        }
    }
    async getByActivity() {
        this._ensureLoggedIn();
        try {
            const { body, headers } = await request(URLs.ACTIVITY, { method: 'GET', headers: this._headers() });
            this._saveCookies(headers);
            const text = await new Response(body).text();
            const torrents = [];
            for (const [id, start_t, updated_t, status, uploaded, downloaded, remaining_t, rate] of this._activityParser.getParams(text)) {
                torrents.push(await this.getTorrent(id, {
                    start: start_t,
                    updated: updated_t,
                    status,
                    uploaded: new Size(uploaded),
                    downloaded: new Size(downloaded),
                    remaining: remaining_t,
                    rate: parseFloat(rate),
                }));
            }
            return torrents;
        }
        catch (e) {
            throw new Error(`Error while get activity. Url: '${URLs.ACTIVITY}'. ${e}`);
        }
    }
    async *getRecommended(type) {
        this._ensureLoggedIn();
        try {
            const { body, headers } = await request(URLs.RECOMMENDED, { method: 'GET', headers: this._headers() });
            this._saveCookies(headers);
            const text = await new Response(body).text();
            for (const id of this._recommendedParser.getIds(text)) {
                const torrent = await this.getTorrent(id);
                if (!type || torrent.get('type') === type) {
                    yield torrent;
                }
            }
        }
        catch (e) {
            throw new Error(`Error while get recommended. Url: '${URLs.RECOMMENDED}'. ${e}`);
        }
    }
    async download(torrent, path, override = false) {
        this._ensureLoggedIn();
        const [filePath, url] = this._prepareDownload(torrent, path);
        try {
            const fs = await import('fs/promises');
            const { body } = await request(url, { method: 'GET', headers: this._headers() });
            const buf = Buffer.from(await new Response(body).arrayBuffer());
            const exists = await fs
                .access(filePath)
                .then(() => true)
                .catch(() => false);
            if (!override && exists)
                throw new Error(`Error while downloading file: '${filePath}'. It is already exists.`);
            await fs.writeFile(filePath, buf);
            return filePath;
        }
        catch (e) {
            throw new Error(`Error while downloading torrent. Url: '${url}'. ${e}`);
        }
    }
    _prepareDownload(torrent, path) {
        const title = String(torrent.get('title'));
        const filename = title.replace(/\s+/g, '_') + '.torrent';
        const url = String(torrent.get('download'));
        const filePath = require('path').join(path, filename);
        return [filePath, url];
    }
    async logout() {
        this._cookies = {};
        this._loggedIn = false;
    }
}
//# sourceMappingURL=client.js.map
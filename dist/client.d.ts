import { SearchParamType, SearchParamWhere, ParamSeq, ParamSort } from './data';
import { Torrent } from './torrent';
import type { SearchResult } from './types';
export declare class Client {
    private _cookies;
    private _loggedIn;
    private _pageParser;
    private _detailedParser;
    private _rssParser;
    private _activityParser;
    private _recommendedParser;
    private _userAgent;
    private _timeout;
    constructor(timeout?: number);
    private _ensureLoggedIn;
    private _headers;
    private _saveCookies;
    login(username: string, password: string): Promise<void>;
    search(pattern: string, type?: SearchParamType, where?: SearchParamWhere, sortBy?: ParamSort, sortOrder?: ParamSeq, page?: number): Promise<SearchResult>;
    getTorrent(id: string, extParams?: Record<string, any>): Promise<Torrent>;
    getByRss(url: string): AsyncGenerator<Torrent, void, unknown>;
    getByActivity(): Promise<Torrent[]>;
    getRecommended(type?: SearchParamType): AsyncGenerator<Torrent, void, unknown>;
    download(torrent: Torrent, path: string, override?: boolean): Promise<string>;
    private _prepareDownload;
    logout(): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map
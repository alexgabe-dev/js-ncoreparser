import { URLs } from './data';
export function getTorrentPageUrl(torrentId) {
    return URLs.DETAIL_PATTERN(torrentId);
}
export class Torrent {
    _details;
    constructor(params) {
        const { id, title, key, size, type, date, seed, leech, ...rest } = params;
        this._details = {
            id,
            title,
            key,
            size,
            type,
            date,
            seed,
            leech,
            download: URLs.DOWNLOAD_LINK(id, key),
            url: getTorrentPageUrl(id),
            ...rest,
        };
    }
    get(key) {
        return this._details[key];
    }
    keys() {
        return Object.keys(this._details);
    }
    toString() {
        return `<Torrent ${this._details['id']}>`;
    }
}
//# sourceMappingURL=torrent.js.map
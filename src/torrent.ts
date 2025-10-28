import { URLs } from './data';

export function getTorrentPageUrl(torrentId: string): string {
  return URLs.DETAIL_PATTERN(torrentId);
}

export type TorrentDetails = {
  id: string;
  title: string;
  key: string;
  size: any; // Size but we dont import to avoid cycles, meh
  type: any;
  date: any;
  seed: string;
  leech: string;
  [k: string]: any;
};

export class Torrent {
  private _details: Record<string, any>;

  constructor(params: TorrentDetails) {
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

  get(key: string) {
    return this._details[key];
  }

  keys(): string[] {
    return Object.keys(this._details);
  }

  toString() {
    return `<Torrent ${this._details['id']}>`;
  }
}

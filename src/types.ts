import type { Torrent } from './torrent';

export type SearchResult = {
  torrents: Torrent[];
  numOfPages: number;
};

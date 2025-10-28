export declare function getTorrentPageUrl(torrentId: string): string;
export type TorrentDetails = {
    id: string;
    title: string;
    key: string;
    size: any;
    type: any;
    date: any;
    seed: string;
    leech: string;
    [k: string]: any;
};
export declare class Torrent {
    private _details;
    constructor(params: TorrentDetails);
    get(key: string): any;
    keys(): string[];
    toString(): string;
}
//# sourceMappingURL=torrent.d.ts.map
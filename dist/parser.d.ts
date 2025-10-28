import { SearchParamType } from './data';
import { Size } from './util';
export declare class TorrentsPageParser {
    private typeRe;
    private idNameRe;
    private dateTimeRe;
    private sizeRe;
    private notFoundRe;
    private seedRe;
    private leechRe;
    private currentPageRe;
    private lastPageRe;
    static getKey(data: string): string;
    private _all;
    private _all2;
    getItems(data: string): {
        id: string;
        title: string;
        key: string;
        date: Date;
        size: Size;
        type: any;
        seed: string;
        leech: string;
    }[];
    getNumOfPages(data: string): number;
}
export declare class TorrenDetailParser {
    private typeRe;
    private dateRe;
    private titleRe;
    private sizeRe;
    private peersRe;
    getItem(data: string): {
        title: string;
        key: string;
        date: Date;
        size: Size;
        type: SearchParamType;
        seed: string;
        leech: string;
    };
}
export declare class RssParser {
    private idRe;
    getIds(data: string): string[];
}
export declare class ActivityParser {
    private patterns;
    getParams(data: string): Array<[string, string, string, string, string, string, string, string]>;
}
export declare class RecommendedParser {
    private recRe;
    getIds(data: string): string[];
}
//# sourceMappingURL=parser.d.ts.map
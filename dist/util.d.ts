export declare class Size {
    private static unitSize;
    private _unit;
    private _size;
    constructor(size: string | number, unit?: string | null);
    private _parseStr;
    toString(): string;
    toJSON(): string;
    private _checkObj;
    add(obj: Size): Size;
    plusEq(obj: Size): this;
    eq(obj: unknown): boolean;
    gt(obj: Size): boolean;
    gte(obj: Size): boolean;
    get unit(): string;
    get size(): number;
    get bytes(): number;
}
export declare function parseDatetime(date: string, time: string): Date;
export declare function requireLogin(obj: {
    _loggedIn?: boolean;
    login?: Function;
}): void;
//# sourceMappingURL=util.d.ts.map
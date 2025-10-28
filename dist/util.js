// some utils
export class Size {
    // bytes map
    static unitSize = {
        B: 1,
        KiB: 1024,
        MiB: 1024 ** 2,
        GiB: 1024 ** 3,
        TiB: 1024 ** 4,
    };
    _unit;
    _size; // in bytes,,
    constructor(size, unit = null) {
        this._unit = unit;
        this._size = 0;
        if (typeof size === 'string') {
            this._parseStr(size || '0 MiB');
        }
        else if (typeof size === 'number') {
            this._size = size;
            if (!this._unit)
                this._unit = 'MiB';
        }
    }
    _parseStr(size) {
        const parts = size.split(' ');
        const num = parts[0] || '0';
        const unit = parts[1] ?? 'MiB';
        this._size = parseFloat(num) * (Size.unitSize[unit] ?? 1024 ** 2);
        this._unit = unit;
    }
    toString() {
        return `${this.size.toFixed(2)} ${this.unit}`;
    }
    // for redable console.log
    toJSON() {
        return this.toString();
    }
    _checkObj(obj) {
        if (!(obj instanceof Size))
            throw new Error(`cant operate Size with ${typeof obj}`);
    }
    add(obj) {
        this._checkObj(obj);
        const size = this._size + obj._size;
        let unit = this._unit ?? 'MiB';
        for (const [u, mult] of Object.entries(Size.unitSize)) {
            const v = Math.trunc(this._size / mult);
            if (0 < v && v <= 1000) {
                unit = u;
                break;
            }
        }
        return new Size(size, unit);
    }
    plusEq(obj) {
        this._checkObj(obj);
        this._size = this._size + obj._size;
        for (const [unit, mult] of Object.entries(Size.unitSize)) {
            const v = Math.trunc(this._size / mult);
            if (0 < v && v <= 1000) {
                this._unit = unit;
                break;
            }
        }
        return this;
    }
    eq(obj) {
        if (!(obj instanceof Size))
            return false;
        return this._size === obj._size;
    }
    gt(obj) {
        this._checkObj(obj);
        return this._size > obj._size;
    }
    gte(obj) {
        this._checkObj(obj);
        return this._size >= obj._size;
    }
    get unit() {
        return this._unit ?? 'MiB';
    }
    get size() {
        const u = this._unit ?? 'MiB';
        return this._size / (Size.unitSize[u] ?? 1024 ** 2);
    }
    get bytes() {
        return Math.trunc(this._size);
    }
}
export function parseDatetime(date, time) {
    // python did f"{date}_{time}" with format "%Y-%m-%d_%H:%M:%S"
    const iso = `${date}T${time}`; // server uses UTCé
    return new Date(iso);
}
export function requireLogin(obj) {
    if (!obj._loggedIn) {
        const fn = obj.login ? obj.login.name || 'login' : 'login';
        throw new Error(`Cannot login to tracker. Please use ${fn} function first.`);
    }
}
//# sourceMappingURL=util.js.map
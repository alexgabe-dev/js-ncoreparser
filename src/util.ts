// some utils

export class Size {
  // bytes map
  private static unitSize: Record<string, number> = {
    B: 1,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
    TiB: 1024 ** 4,
  };

  private _unit: string | null;
  private _size: number; // in bytes,,

  constructor(size: string | number, unit: string | null = null) {
    this._unit = unit;
    this._size = 0;
    if (typeof size === 'string') {
      this._parseStr(size || '0 MiB');
    } else if (typeof size === 'number') {
      this._size = size;
      if (!this._unit) this._unit = 'MiB';
    }
  }

  private _parseStr(size: string) {
    const parts = size.split(' ');
    const num = parts[0] || '0';
    const unit = parts[1] ?? 'MiB';
    this._size = parseFloat(num) * (Size.unitSize[unit] ?? 1024 ** 2);
    this._unit = unit;
  }

  toString(): string {
    return `${this.size.toFixed(2)} ${this.unit}`;
  }

  // for redable console.log
  toJSON(): string {
    return this.toString();
  }

  private _checkObj(obj: unknown) {
    if (!(obj instanceof Size)) throw new Error(`cant operate Size with ${typeof obj}`);
  }

  add(obj: Size): Size {
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

  plusEq(obj: Size): this {
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

  eq(obj: unknown): boolean {
    if (!(obj instanceof Size)) return false;
    return this._size === obj._size;
  }

  gt(obj: Size): boolean {
    this._checkObj(obj);
    return this._size > obj._size;
  }

  gte(obj: Size): boolean {
    this._checkObj(obj);
    return this._size >= obj._size;
  }

  get unit(): string {
    return this._unit ?? 'MiB';
  }

  get size(): number {
    const u = this._unit ?? 'MiB';
    return this._size / (Size.unitSize[u] ?? 1024 ** 2);
    
  }

  get bytes(): number {
    return Math.trunc(this._size);
  }
}

export function parseDatetime(date: string, time: string): Date {
  // python did f"{date}_{time}" with format "%Y-%m-%d_%H:%M:%S"
  const iso = `${date}T${time}`; // server uses UTCé
  return new Date(iso);
}

export function requireLogin(obj: { _loggedIn?: boolean; login?: Function }) {
  if (!obj._loggedIn) {
    const fn = obj.login ? obj.login.name || 'login' : 'login';
    throw new Error(`Cannot login to tracker. Please use ${fn} function first.`);
  }
}

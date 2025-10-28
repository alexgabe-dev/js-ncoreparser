import * as cheerio from 'cheerio';
import { SearchParamType, getDetailedParam } from './data';
import { Size, parseDatetime } from './util';
export class TorrentsPageParser {
    typeRe = /<a href=".*\/torrents\.php\?tipus=(.*?)"><img src=".*" class="categ_link" alt=".*" title=".*">/g;
    idNameRe = /<a href=".*?" onclick="torrent\(([0-9]+)\); return false;" title="(.*?)">/g;
    dateTimeRe = /<div class="box_feltoltve2">(.*?)<br>(.*?)<\/div>/g;
    sizeRe = /<div class="box_meret2">(.*?)<\/div>/g;
    notFoundRe = /<div class="lista_mini_error">Nincs találat!<\/div>/;
    seedRe = /<div class="box_s2"><a class="torrent" href=".*">([0-9]+)<\/a><\/div>/g;
    leechRe = /<div class="box_l2"><a class="torrent" href=".*">([0-9]+)<\/a><\/div>/g;
    currentPageRe = /<span class="active_link"><strong>(\d+).*?<\/strong><\/span>/;
    lastPageRe = /<a href="\/torrents\.php\?oldal=(\d+)[^>]*><strong>Utolsó<\/strong><\/a>/;
    static getKey(data) {
        const m = data.match(/<link rel="alternate" href=".*?\/rss.php\?key=(?<key>[a-z,0-9]+)" title=".*"/);
        const key = (m && m.groups?.key) || null;
        if (key)
            return key;
        throw new Error('cant read user key from page');
    }
    _all(re, data) {
        const out = [];
        let m;
        const r = new RegExp(re.source, re.flags);
        while ((m = r.exec(data))) {
            if (m[1] !== undefined)
                out.push(m[1]);
        }
        return out;
    }
    _all2(re, data) {
        const out = [];
        let m;
        const r = new RegExp(re.source, re.flags);
        while ((m = r.exec(data))) {
            if (m[1] !== undefined && m[2] !== undefined)
                out.push([m[1], m[2]]);
        }
        return out;
    }
    getItems(data) {
        const types = this._all(this.typeRe, data);
        const idsAndNames = this._all2(this.idNameRe, data);
        const datesAndTimes = this._all2(this.dateTimeRe, data);
        const sizes = this._all(this.sizeRe, data);
        const seed = this._all(this.seedRe, data);
        const leech = this._all(this.leechRe, data);
        let ids = [];
        let names = [];
        let dates = [];
        let times = [];
        let key = '';
        if (types.length &&
            types.length === idsAndNames.length &&
            types.length === datesAndTimes.length &&
            types.length === sizes.length &&
            types.length === seed.length &&
            types.length === leech.length) {
            ids = idsAndNames.map((x) => x[0]);
            names = idsAndNames.map((x) => x[1]);
            dates = datesAndTimes.map((x) => x[0]);
            times = datesAndTimes.map((x) => x[1]);
            key = TorrentsPageParser.getKey(data);
        }
        else {
            if (!this.notFoundRe.test(data)) {
                throw new Error(`cant parse download items in ${this.constructor.name}`);
            }
        }
        return ids.map((id, i) => ({
            id,
            title: names[i] ?? '',
            key,
            date: parseDatetime(dates[i] ?? '1970-01-01', times[i] ?? '00:00:00'),
            size: new Size(sizes[i] ?? '0 MiB'),
            type: SearchParamType[types[i]] ?? types[i],
            seed: seed[i] ?? '0',
            leech: leech[i] ?? '0',
        }));
    }
    getNumOfPages(data) {
        const current = this.currentPageRe.exec(data);
        const last = this.lastPageRe.exec(data);
        let numOfPages = 0;
        if (current) {
            const currentNumOfItems = parseInt(current?.[1] ?? '0', 10);
            numOfPages = Math.ceil(currentNumOfItems / 25);
        }
        if (last) {
            const lastPage = parseInt(last?.[1] ?? '0', 10);
            numOfPages = Math.max(numOfPages, lastPage);
        }
        return numOfPages;
    }
}
export class TorrenDetailParser {
    typeRe = new RegExp('<div class="dd"><a title=".*?" href=".*?torrents.php\\?csoport_listazas=' +
        '(?<category>.*?)">.*?</a>.*?<a title=".*?" href=".*?torrents.php\\?tipus=' +
        '(?<type>.*?)">.*?</a></div>');
    dateRe = /<div class="dd">(?<date>[0-9]{4}\-[0-9]{2}\-[0-9]{2}\ [0-9]{2}\:[0-9]{2}\:[0-9]{2})<\/div>/;
    titleRe = /<div class="torrent_reszletek_cim">(?<title>.*?)<\/div>/;
    sizeRe = /<div class="dd">(?<size>[0-9,.]+\ [K,M,G,T]{1}iB)\ \(.*?\)<\/div>/;
    peersRe = /div class="dt">Seederek:<\/div>.*?<div class="dd"><a onclick=".*?">(?<seed>[0-9]+)<\/a><\/div>.*?<div class="dt">Leecherek:<\/div>.*?<div class="dd"><a onclick=".*?">(?<leech>[0-9]+)<\/a><\/div>/s;
    getItem(data) {
        const tMatch = this.typeRe.exec(data);
        if (!tMatch || !tMatch.groups)
            throw new Error('Type pattern not found');
        const category = tMatch.groups.category ?? 'osszes_film_hd';
        const type = tMatch.groups.type ?? 'hd';
        const tType = getDetailedParam(category, type);
        const dMatch = this.dateRe.exec(data);
        if (!dMatch || !dMatch.groups)
            throw new Error('Date pattern not found');
        const dateStr = dMatch.groups.date ?? '1970-01-01 00:00:00';
        const date = new Date(dateStr.replace(' ', 'T'));
        const titleMatch = this.titleRe.exec(data);
        if (!titleMatch || !titleMatch.groups)
            throw new Error('Title pattern not found');
        const title = titleMatch.groups.title ?? '';
        const key = TorrentsPageParser.getKey(data);
        const sizeMatch = this.sizeRe.exec(data);
        if (!sizeMatch || !sizeMatch.groups)
            throw new Error('Size pattern not found');
        const size = new Size((sizeMatch.groups.size ?? '0 MiB'));
        const peersMatch = this.peersRe.exec(data);
        if (!peersMatch || !peersMatch.groups)
            throw new Error('Peers pattern not found');
        const seed = peersMatch.groups.seed ?? '0';
        const leech = peersMatch.groups.leech ?? '0';
        return { title, key, date, size, type: tType, seed, leech };
    }
}
export class RssParser {
    idRe = /<source url=".*?\/rss_dl.php\/id=(?<id>[0-9]+)\/key\=.[a-z,0-9]+">/g;
    getIds(data) {
        const out = [];
        let m;
        const r = new RegExp(this.idRe.source, this.idRe.flags);
        while ((m = r.exec(data))) {
            if (m.groups?.id)
                out.push(m.groups.id);
        }
        return out;
    }
}
export class ActivityParser {
    patterns = [
        /onclick="torrent\((.*?)\);/g,
        /<div class="hnr_tstart">(.*?)<\/div>/g,
        /<div class="hnr_tlastactive">(.*?)<\/div>/g,
        /<div class="hnr_tseed"><span class=".*?">(.*?)<\/span><\/div>/g,
        /<div class="hnr_tup">(.*?)<\/div>/g,
        /<div class="hnr_tdown">(.*?)<\/div>/g,
        /<div class="hnr_ttimespent"><span class=".*?">(.*?)<\/span><\/div>/g,
        /<div class="hnr_tratio"><span class=".*?">(.*?)<\/span><\/div>/g,
    ];
    getParams(data) {
        const out = [];
        for (const re of this.patterns) {
            const items = [];
            let m;
            const r = new RegExp(re.source, re.flags);
            while ((m = r.exec(data)))
                if (m[1] !== undefined)
                    items.push(m[1]);
            out.push(items);
        }
        const zipped = [];
        const len = out[0]?.length || 0;
        for (let i = 0; i < len; i++) {
            zipped.push(out.map((col) => col[i]));
        }
        return zipped;
    }
}
export class RecommendedParser {
    recRe = /<a href=".*?torrents.php\?action=details\&id=(.*?)" target=".*?"><img src=".*?" width=".*?" height=".*?" border=".*?" title=".*?"\/><\/a>/g;
    getIds(data) {
        const out = [];
        let m;
        const r = new RegExp(this.recRe.source, this.recRe.flags);
        while ((m = r.exec(data)))
            if (m[1] !== undefined)
                out.push(m[1]);
        return out;
    }
}
//# sourceMappingURL=parser.js.map
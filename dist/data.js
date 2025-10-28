// urls and enums, kinda mirroring the py version but.. js style :)
// Ported to js by @alexgabe-dev, original py idea: @radaron
export var ParamSort;
(function (ParamSort) {
    ParamSort["NAME"] = "name";
    ParamSort["UPLOAD"] = "fid";
    ParamSort["SIZE"] = "size";
    ParamSort["TIMES_COMPLETED"] = "times_completed";
    ParamSort["SEEDERS"] = "seeders";
    ParamSort["LEECHERS"] = "leechers";
})(ParamSort || (ParamSort = {}));
export var SearchParamType;
(function (SearchParamType) {
    SearchParamType["SD_HUN"] = "xvid_hun";
    SearchParamType["SD"] = "xvid";
    SearchParamType["DVD_HUN"] = "dvd_hun";
    SearchParamType["DVD"] = "dvd";
    SearchParamType["DVD9_HUN"] = "dvd9_hun";
    SearchParamType["DVD9"] = "dvd9";
    SearchParamType["HD_HUN"] = "hd_hun";
    SearchParamType["HD"] = "hd";
    SearchParamType["SDSER_HUN"] = "xvidser_hun";
    SearchParamType["SDSER"] = "xvidser";
    SearchParamType["DVDSER_HUN"] = "dvdser_hun";
    SearchParamType["DVDSER"] = "dvdser";
    SearchParamType["HDSER_HUN"] = "hdser_hun";
    SearchParamType["HDSER"] = "hdser";
    SearchParamType["MP3_HUN"] = "mp3_hun";
    SearchParamType["MP3"] = "mp3";
    SearchParamType["LOSSLESS_HUN"] = "lossless_hun";
    SearchParamType["LOSSLESS"] = "lossless";
    SearchParamType["CLIP"] = "clip";
    SearchParamType["GAME_ISO"] = "game_iso";
    SearchParamType["GAME_RIP"] = "game_rip";
    SearchParamType["CONSOLE"] = "console";
    SearchParamType["EBOOK_HUN"] = "ebook_hun";
    SearchParamType["EBOOK"] = "ebook";
    SearchParamType["ISO"] = "iso";
    SearchParamType["MISC"] = "misc";
    SearchParamType["MOBIL"] = "mobil";
    SearchParamType["XXX_IMG"] = "xxx_imageset";
    SearchParamType["XXX_SD"] = "xxx_xvid";
    SearchParamType["XXX_DVD"] = "xxx_dvd";
    SearchParamType["XXX_HD"] = "xxx_hd";
    SearchParamType["ALL_OWN"] = "all_own";
})(SearchParamType || (SearchParamType = {}));
export var SearchParamWhere;
(function (SearchParamWhere) {
    SearchParamWhere["NAME"] = "name";
    SearchParamWhere["DESCRIPTION"] = "leiras";
    SearchParamWhere["IMDB"] = "imdb";
    SearchParamWhere["LABEL"] = "cimke";
})(SearchParamWhere || (SearchParamWhere = {}));
export var ParamSeq;
(function (ParamSeq) {
    ParamSeq["INCREASING"] = "ASC";
    ParamSeq["DECREASING"] = "DESC";
})(ParamSeq || (ParamSeq = {}));
export const URLs = {
    INDEX: "https://ncore.pro/index.php",
    LOGIN: "https://ncore.pro/login.php",
    ACTIVITY: "https://ncore.pro/hitnrun.php",
    RECOMMENDED: "https://ncore.pro/recommended.php",
    TORRENTS_BASE: "https://ncore.pro/torrents.php",
    DOWNLOAD_PATTERN: (args) => `https://ncore.pro/torrents.php?oldal=${args.page}&tipus=${args.t_type}&miszerint=${args.sort}&hogyan=${args.seq}&mire=${encodeURIComponent(args.pattern)}&miben=${args.where}`,
    DETAIL_PATTERN: (id) => `https://ncore.pro/torrents.php?action=details&id=${id}`,
    DOWNLOAD_LINK: (id, key) => `https://ncore.pro/torrents.php?action=download&id=${id}&key=${key}`,
};
// The detailed page maps category+type to SearchParamType. not pretty, but honest.
export function getDetailedParam(category, type) {
    const key = `${category}_${type}`;
    const map = {
        osszes_film_xvid_hun: SearchParamType.SD_HUN,
        osszes_film_xvid: SearchParamType.SD,
        osszes_film_dvd_hun: SearchParamType.DVD_HUN,
        osszes_film_dvd: SearchParamType.DVD,
        osszes_film_dvd9_hun: SearchParamType.DVD9_HUN,
        osszes_film_dvd9: SearchParamType.DVD9,
        osszes_film_hd_hun: SearchParamType.HD_HUN,
        osszes_film_hd: SearchParamType.HD,
        osszes_sorozat_xvidser_hun: SearchParamType.SDSER_HUN,
        osszes_sorozat_xvidser: SearchParamType.SDSER,
        osszes_sorozat_dvdser_hun: SearchParamType.DVDSER_HUN,
        osszes_sorozat_dvdser: SearchParamType.DVDSER,
        osszes_sorozat_hdser_hun: SearchParamType.HDSER_HUN,
        osszes_sorozat_hdser: SearchParamType.HDSER,
        osszes_zene_mp3_hun: SearchParamType.MP3_HUN,
        osszes_zene_mp3: SearchParamType.MP3,
        osszes_zene_lossless_hun: SearchParamType.LOSSLESS_HUN,
        osszes_zene_lossless: SearchParamType.LOSSLESS,
        osszes_zene_clip: SearchParamType.CLIP,
        osszes_jatek_game_iso: SearchParamType.GAME_ISO,
        osszes_jatek_game_rip: SearchParamType.GAME_RIP,
        osszes_jatek_console: SearchParamType.CONSOLE,
        osszes_konyv_ebook_hun: SearchParamType.EBOOK_HUN,
        osszes_konyv_ebook: SearchParamType.EBOOK,
        osszes_program_iso: SearchParamType.ISO,
        osszes_program_misc: SearchParamType.MISC,
        osszes_program_mobil: SearchParamType.MOBIL,
        osszes_xxx_xxx_imageset: SearchParamType.XXX_IMG,
        osszes_xxx_xxx_xvid: SearchParamType.XXX_SD,
        osszes_xxx_xxx_dvd: SearchParamType.XXX_DVD,
        osszes_xxx_xxx_hd: SearchParamType.XXX_HD,
    };
    const detailed = map[key];
    if (!detailed)
        throw new Error("cant get type by detailed page :(");
    return detailed;
}
//# sourceMappingURL=data.js.map
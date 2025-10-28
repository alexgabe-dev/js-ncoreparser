export declare enum ParamSort {
    NAME = "name",
    UPLOAD = "fid",
    SIZE = "size",
    TIMES_COMPLETED = "times_completed",
    SEEDERS = "seeders",
    LEECHERS = "leechers"
}
export declare enum SearchParamType {
    SD_HUN = "xvid_hun",
    SD = "xvid",
    DVD_HUN = "dvd_hun",
    DVD = "dvd",
    DVD9_HUN = "dvd9_hun",
    DVD9 = "dvd9",
    HD_HUN = "hd_hun",
    HD = "hd",
    SDSER_HUN = "xvidser_hun",
    SDSER = "xvidser",
    DVDSER_HUN = "dvdser_hun",
    DVDSER = "dvdser",
    HDSER_HUN = "hdser_hun",
    HDSER = "hdser",
    MP3_HUN = "mp3_hun",
    MP3 = "mp3",
    LOSSLESS_HUN = "lossless_hun",
    LOSSLESS = "lossless",
    CLIP = "clip",
    GAME_ISO = "game_iso",
    GAME_RIP = "game_rip",
    CONSOLE = "console",
    EBOOK_HUN = "ebook_hun",
    EBOOK = "ebook",
    ISO = "iso",
    MISC = "misc",
    MOBIL = "mobil",
    XXX_IMG = "xxx_imageset",
    XXX_SD = "xxx_xvid",
    XXX_DVD = "xxx_dvd",
    XXX_HD = "xxx_hd",
    ALL_OWN = "all_own"
}
export declare enum SearchParamWhere {
    NAME = "name",
    DESCRIPTION = "leiras",
    IMDB = "imdb",
    LABEL = "cimke"
}
export declare enum ParamSeq {
    INCREASING = "ASC",
    DECREASING = "DESC"
}
export declare const URLs: {
    readonly INDEX: "https://ncore.pro/index.php";
    readonly LOGIN: "https://ncore.pro/login.php";
    readonly ACTIVITY: "https://ncore.pro/hitnrun.php";
    readonly RECOMMENDED: "https://ncore.pro/recommended.php";
    readonly TORRENTS_BASE: "https://ncore.pro/torrents.php";
    readonly DOWNLOAD_PATTERN: (args: {
        page: number;
        t_type: string;
        sort: string;
        seq: string;
        pattern: string;
        where: string;
    }) => string;
    readonly DETAIL_PATTERN: (id: string) => string;
    readonly DOWNLOAD_LINK: (id: string, key: string) => string;
};
export declare function getDetailedParam(category: string, type: string): SearchParamType;
//# sourceMappingURL=data.d.ts.map
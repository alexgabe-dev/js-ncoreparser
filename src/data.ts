// urls and enums, kinda mirroring the py version but.. js style :)
// Ported to js by @alexgabe-dev, original py idea: @radaron

export enum ParamSort {
  NAME = "name",
  UPLOAD = "fid",
  SIZE = "size",
  TIMES_COMPLETED = "times_completed",
  SEEDERS = "seeders",
  LEECHERS = "leechers",
}

export enum SearchParamType {
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
  ALL_OWN = "all_own",
}

export enum SearchParamWhere {
  NAME = "name",
  DESCRIPTION = "leiras",
  IMDB = "imdb",
  LABEL = "cimke",
}

export enum ParamSeq {
  INCREASING = "ASC",
  DECREASING = "DESC",
}

export const URLs = {
  INDEX: "https://ncore.pro/index.php",
  LOGIN: "https://ncore.pro/login.php",
  ACTIVITY: "https://ncore.pro/hitnrun.php",
  RECOMMENDED: "https://ncore.pro/recommended.php",
  TORRENTS_BASE: "https://ncore.pro/torrents.php",
  DOWNLOAD_PATTERN: (args: {
    page: number;
    t_type: string;
    sort: string;
    seq: string;
    pattern: string;
    where: string;
  }) =>
    `https://ncore.pro/torrents.php?oldal=${args.page}&tipus=${args.t_type}&miszerint=${args.sort}&hogyan=${args.seq}&mire=${encodeURIComponent(
      args.pattern
    )}&miben=${args.where}`,
  DETAIL_PATTERN: (id: string) => `https://ncore.pro/torrents.php?action=details&id=${id}`,
  DOWNLOAD_LINK: (id: string, key: string) =>
    `https://ncore.pro/torrents.php?action=download&id=${id}&key=${key}`,
} as const;

// The detailed page maps category+type to SearchParamType. not pretty, but honest.
export function getDetailedParam(category: string, type: string): SearchParamType {
  const key = `${category}_${type}`;
  const map: Record<string, SearchParamType> = {
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
  if (!detailed) throw new Error("cant get type by detailed page :(");
  return detailed;
}

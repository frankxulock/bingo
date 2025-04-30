export enum UrlParamsKeys {
    TOKEN = "token",
    LANG = "l",
    GAMEID = "game_code",
}

export enum DecodeParamsKeys {
    LANG = "l",
    GAMEID = "game_code",
}

export class UrlManager {
    private static url: string = null;
    private static urlParams: URLSearchParams = null;
    private static decodeParams: URLSearchParams = null;

    public static init(url: string) {
        if (this.url == url) {
            return;
        }
        const urlObject: URL = new URL(url);
        const urlParams: URLSearchParams = new URLSearchParams(urlObject.search.replace("?", "&"));
        const decodeData: string = atob(decodeURIComponent(urlParams.get(UrlParamsKeys.TOKEN)));
        const decodeParams: URLSearchParams = new URLSearchParams(decodeData);

        this.url = url;
        this.urlParams = urlParams;
        this.decodeParams = decodeParams;
    }

    public static getDecodeParams<T extends DecodeParamsKeys>(key: T): string | null {
        this.init(window.location.href);
        return this.decodeParams.get(key);
    }

    public static getUrlParams<T extends UrlParamsKeys>(key: T): string | null {
        this.init(window.location.href);
        return this.urlParams.get(key);
    }

    public static setUrlParams<T extends UrlParamsKeys>(key: T, value: string): void {
        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        history.replaceState(null, null, url.toString());
    }

    public static delUrlParams<T extends UrlParamsKeys>(key: T): void {
        const url = new URL(window.location.href);
        url.searchParams.delete(key);
        history.replaceState(null, null, url.toString());
    }

    public static getLang(): string {
        this.init(window.location.href);
        const testLanguage: string = this.urlParams.get(UrlParamsKeys.LANG);
        if (testLanguage) {
            return testLanguage;
        }

        const decodeLanguage: string = this.decodeParams.get(DecodeParamsKeys.LANG);
        return decodeLanguage || "tw";
    }

    public static getGameID(): string {
        this.init(window.location.href);
        const testLanguage: string = this.urlParams.get(UrlParamsKeys.GAMEID);
        if (testLanguage) {
            return testLanguage;
        }

        const decodeLanguage: string = this.decodeParams.get(DecodeParamsKeys.GAMEID);
        return decodeLanguage || "1";
    }
}

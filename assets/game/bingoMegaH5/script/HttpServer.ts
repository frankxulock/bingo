// HttpService.ts
export class HttpServer {
    /** 建立卡片資料 */
    static async CardCreate_POST(cards: any, multiples: number, play_code: number) {
        const payload = {
        game_code: window.url.getGame(),
        cards: cards,
        multiples: multiples,
        play_code: play_code
        };

        return window.DataFetcher.fetchSingle({
        key: "createCard",
        url: window.url.getCreateCard(),
        options: window.url.getHeaders_POST(payload),
        });
    }
}
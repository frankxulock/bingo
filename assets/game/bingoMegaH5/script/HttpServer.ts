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

    /** 請求DIY收藏卡片資訊 */
    static async DIYCardList(current: number = 1, size : number = 1000) {
        const payload = {
            current: current,
            size: size,
        };

        return window.DataFetcher.fetchSingle({
            key: "DIYCardList",
            url: window.url.getDIYCard(),
            options: window.url.getHeaders_POST(payload),
        })
    }

    /** 請求DIY冷熱球號資訊 (開啟DIY編輯頁面) */
    static async DIYCount() {
        return window.DataFetcher.fetchSingle({
            key: "DIYCount",
            url: window.url.getDIYCount(),
            options: window.url.getHeaders(),
        })
    }

    /** 創建DIY卡片 */
    static async DIYCreate(card_detail: string, game_code : string = "BGM") {
        const payload = {
            card_detail: card_detail,
            game_code: game_code,
        };

        return window.DataFetcher.fetchSingle({
            key: "DIYCreate",
            url: window.url.getDIYCreate(),
            options: window.url.getHeaders_POST(payload),
        })
    }

    /** 更新DIY卡片 */
    static async DIYUpdate(card_detail: string, id: string) {
        return window.DataFetcher.fetchSingle({
            key: "DIYUpdate",
            url: window.url.getDIYUpdate(card_detail, id),
            options: window.url.getHeaders(),
        })
    }

    /** 刪除DIY卡片 */
    static async DIYDelete(id: string) {
        return window.DataFetcher.fetchSingle({
            key: "DIYDelete",
            url: window.url.getDIYDelete(id),
            options: window.url.getHeaders(),
        })
    }

    /** 請求玩家個人歷史紀錄資訊 */
    static async InfoHistory(start_at: number, end_at: number, status: number,page: number = 1, size : number = 10) {
        const payload = {
            game_code: window.url.getGame(),
            start_at: start_at, // 開始日期
            end_at: end_at,     // 結束日期
            status: status,     // 查詢類型
            page: page,
            size: size,
        }

        return window.DataFetcher.fetchSingle({
            key: "InfoHisotry",
            url: window.url.getInfoHistory(),
            options: window.url.getHeaders_POST(payload),
        })
    }
}
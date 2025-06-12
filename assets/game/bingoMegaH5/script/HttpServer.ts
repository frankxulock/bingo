// HttpService.ts
export class HttpServer {
    /** 建立卡片資料 */
    static async CardCreate_POST(cards: any, multiples: number, play_code: number) {
        try {
            const payload = {
                game_code: window.url.getGame(),
                cards: cards,
                multiples: multiples,
                play_code: play_code
            };

            return await window.DataFetcher.fetchSingle({
                key: "createCard",
                url: window.url.getCreateCard(),
                options: window.url.getHeaders_POST(payload),
            });
        } catch (error) {
            cc.error('[HttpServer] CardCreate_POST 失败:', error);
            throw error;
        }
    }

    /** 請求DIY收藏卡片資訊 */
    static async DIYCardList(current: number = 1, size: number = 1000) {
        try {
            const payload = { current, size };

            return await window.DataFetcher.fetchSingle({
                key: "DIYCardList",
                url: window.url.getDIYCard(),
                options: window.url.getHeaders_POST(payload),
            });
        } catch (error) {
            cc.error('[HttpServer] DIYCardList 失败:', error);
            throw error;
        }
    }

    /** 請求DIY冷熱球號資訊 (開啟DIY編輯頁面) */
    static async DIYCount() {
        try {
            return await window.DataFetcher.fetchSingle({
                key: "DIYCount",
                url: window.url.getDIYCount(),
                options: window.url.getHeaders(),
            });
        } catch (error) {
            cc.error('[HttpServer] DIYCount 失败:', error);
            throw error;
        }
    }

    /** 創建DIY卡片 */
    static async DIYCreate(card_detail: string, game_code: string = "BGM") {
        try {
            const payload = {
                card_detail: card_detail,
                game_code: game_code,
            };

            return await window.DataFetcher.fetchSingle({
                key: "DIYCreate",
                url: window.url.getDIYCreate(),
                options: window.url.getHeaders_POST(payload),
            });
        } catch (error) {
            cc.error('[HttpServer] DIYCreate 失败:', error);
            throw error;
        }
    }

    /** 更新DIY卡片 */
    static async DIYUpdate(card_detail: string, id: string) {
        try {
            return await window.DataFetcher.fetchSingle({
                key: "DIYUpdate",
                url: window.url.getDIYUpdate(card_detail, id),
                options: window.url.getHeaders(),
            });
        } catch (error) {
            cc.error('[HttpServer] DIYUpdate 失败:', error);
            throw error;
        }
    }

    /** 刪除DIY卡片 */
    static async DIYDelete(id: string) {
        try {
            return await window.DataFetcher.fetchSingle({
                key: "DIYDelete",
                url: window.url.getDIYDelete(id),
                options: window.url.getHeaders(),
            });
        } catch (error) {
            cc.error('[HttpServer] DIYDelete 失败:', error);
            throw error;
        }
    }

    /** 請求玩家個人歷史紀錄資訊 */
    static async InfoHistory(start_at: number, end_at: number, status: number, page: number = 1, size: number = 10) {
        try {
            const payload = {
                game_code: window.url.getGame(),
                start_at: start_at, // 開始日期
                end_at: end_at,     // 結束日期
                status: status,     // 查詢類型
                page: page,
                size: size,
            };

            return await window.DataFetcher.fetchSingle({
                key: "InfoHistory",
                url: window.url.getInfoHistory(),
                options: window.url.getHeaders_POST(payload),
            });
        } catch (error) {
            cc.error('[HttpServer] InfoHistory 失败:', error);
            throw error;
        }
    }

    /** 
     * 批量請求多個API
     * 用於需要同時獲取多個資料的場景
     */
    static async batchRequests(requests: Array<{
        type: 'DIYCardList' | 'DIYCount' | 'InfoHistory',
        params?: any
    }>): Promise<any[]> {
        try {
            const promises = requests.map(req => {
                switch(req.type) {
                    case 'DIYCardList':
                        return this.DIYCardList(req.params?.current, req.params?.size);
                    case 'DIYCount':
                        return this.DIYCount();
                    case 'InfoHistory':
                        return this.InfoHistory(
                            req.params?.start_at, 
                            req.params?.end_at, 
                            req.params?.status,
                            req.params?.page,
                            req.params?.size
                        );
                    default:
                        throw new Error(`Unknown request type: ${req.type}`);
                }
            });

            return await Promise.all(promises);
        } catch (error) {
            cc.error('[HttpServer] batchRequests 失败:', error);
            throw error;
        }
    }
}
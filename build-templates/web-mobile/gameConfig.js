const GameConfig = {
    // HTTP: "https://",
    // SERVERHOST: "devpc.okbingos.com/",
    HTTP:  "http://",
    SERVERHOST:  "localhost:3000/proxy/",
    MEGA: "BGM",
    RUSH: "BGR",

    // GET請求
    ID:         "gameApi/api/front/game/round/id",
    JACKPOT:    "gameApi/api/front/game/jackpot",
    LIST:       "gameApi/api/front/game/patten/list",
    ONLINE:     "gameApi/api/front/game/online",

    /** 目前遊戲 */
    getGame() {
        return this.MEGA;
    },
    /** ID Url */
    getIDUrl() {
        return `${this.HTTP}${this.SERVERHOST}${this.ID}?game_code=${this.getGame()}`;
    },
    /** Jackpot Url */
    getJACKPOTUrl() {
        return `${this.HTTP}${this.SERVERHOST}${this.JACKPOT}?game_code=${this.getGame()}`;
    },
    /** 倍率金額 Url */
    getLISTUrl() {
        return `${this.HTTP}${this.SERVERHOST}${this.LIST}?game_code=${this.getGame()}`;
    },
    /** 線上人數 */
    getONLINEUrl() {
        // merchantId=692 商戶ID,暫時先寫死等待未來商戶增加動態擴增
        return `${this.HTTP}${this.SERVERHOST}${this.ONLINE}?merchantId=692`;
    },


    /** 取得協議頭(部分請求才需要新增) */
    getHeaders() {
        return {
            method: "GET",
            headers: {
                "merchant_code": "mer_api_code_bobbob",
            }
        };
    }
}

window.GameConfig = GameConfig;
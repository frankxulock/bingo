const { ccclass, property } = cc._decorator;
// ********  基礎公用數據 *************

// 遊戲狀態
export enum GAME_STATUS {
    LOADING,            //加載
    BUY,                //下注時間
    DRAWTHENUMBERS,     //開球時間
    REWARD,             //中獎表演
    GAMEOVER,           //遊戲結束
}

// 卡片類型
export enum CARD_STATUS {
    NORMAL,     // 當局
    PREORDER,   // 預購卡
}

/** 卡片內容 */
export enum CARD_CONTENT {
    NORMAL, // 正常卡片
    DIY,    // DIY卡片
}

// 卡片玩法
export enum CARD_GAMEPLAY {
    COMDO,      // Comdo玩法
    EXTRA,      // 額外球玩法
    JACKPOT,    // Jackpot玩法卡片
}

export const WEB_EVENT = cc.Enum({
    RULES: "RULES",
    PAYTABLE: "PAYTABLE",
    HISTORY: "HISTORY",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    START_GAME: "START_GAME",
    GAME_ERROR: "GAME_ERROR",
    SPEED_MODE: "SPEED_MODE",
    MIN_BET: "MIN_BET",
    MAX_BET: "MAX_BET",
    AUTO_SPIN: "AUTO_SPIN",
    BALANCE: "BALANCE",
    BET_OPTIONS: "BET_OPTIONS",
    AUTO_SPIN_RESULT: "AUTO_SPIN_RESULT",
    BET_OPTIONS_RESULT: "BET_OPTIONS_RESULT",
    EXIT_GAME: "EXIT_GAME",
    NETWORK_RECONNECTING: "NETWORK_RECONNECTING",
    NETWORK_RECONNECT_FAILED: "NETWORK_RECONNECT_FAILED",
});

export const ERROR_CODE = cc.Enum({
    NOT_ENOUGH_BALANCE: "3202",
    UNKNOWN_ERROR: "20000",
})

declare interface Window {
    loginData: any
}

// TcPlayer 全局類型聲明
declare global {
    interface Window {
        serverData: any;
        url: any;
        DataFetcher: any;
        TcPlayer: any;
    }
}
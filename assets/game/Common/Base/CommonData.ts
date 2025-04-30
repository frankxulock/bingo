// 基礎公用數據
const { ccclass } = cc._decorator;

// 遊戲狀態
export enum GAME_STATUS {
    IDLE,   //閒置
    BUY,    //購卡
    DRAWTHENUMBERS,   //開球 Draw the Numbers
    EXTRABALL, //額外球
    REWARD, //中獎
}

// 卡片類型
export enum CARD_STATUS {
    NONE,   // 無
    NORMAL, // 正常卡片
    DIY,    // DIY卡片
    PREORDER,// 預購卡
}

// 卡片玩法
export enum CARD_GAMEPLAY {
    NONE,   // 無
    JACKPOT, // Jackpot玩法卡片
    EXTRA,  // 額外球玩法
    COMDO,  //
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
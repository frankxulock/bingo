import Singleton from "./Singleton";

/** 廣播事件 */
const { ccclass } = cc._decorator;
@ccclass
export default class EventManager extends Singleton  {
    _eventMap: {} = [];  // 用来存储所有事件及其对应的监听器
    // 注册监听器
    on(eventName, listener, target) {
        if (!this._eventMap[eventName]) {
            this._eventMap[eventName] = [];
        }
        // 添加监听器
        this._eventMap[eventName].push({ listener, target });
    }

    // 移除监听器
    off(eventName, listener, target) {
        if (this._eventMap[eventName]) {
            this._eventMap[eventName] = this._eventMap[eventName].filter(
                item => item.listener !== listener || item.target !== target
            );
        }
    }
    // 广播事件
    emit(eventName, data?) {
        if (this._eventMap[eventName]) {
            // 遍历所有监听器，调用它们
            this._eventMap[eventName].forEach(item => {
                item.listener.call(item.target, data);
            });
        }
    }
}

/** 遊戲狀態事件通知 */
export class GameStateEvent {
    /** 遊戲狀態通知 */
    public static GAME_LOADING = "GAME_LOADING";
    public static GAME_BUY = "GAME_BUY";
    public static GAME_DRAWTHENUMBERS = "GAME_DRAWTHENUMBERS";
    public static GAME_REWARD = "GAME_REWARD";
    public static GAME_SNAPSHOT = "GAME_SNAPSHOT";
    public static GAME_OVER = "GAME_OVER";
}

/** 遊戲內部狀態更新 */
export class GameStateUpdate {
    // 更新遊戲金額
    public static StaticUpdate_Coin = "StaticUpdate_Coin";
    // 更新倒計時
    public static StaticUpdate_Countdown = "StaticUpdate_Countdown";
    // 講池更新事件
    public static StateUpdate_BingoJackpot = "StateUpdate_BingoJackpot";
    // 下注回包事件
    public static StateUpdate_BetResponseEvent = "StateUpdate_BetResponseEvent";
    // 開啟已購卡頁面
    public static StateUpdate_OpenPurchasedTicketPage = "StateUpdate_OpenPurchasedTicketPage";
    // 發球事件
    public static StateUpdate_SendBall = "StateUpdate_SendBall";
    // 開啟DIY卡片編輯頁面
    public static StateUpdate_OpenDIYEditPage = "StateUpdate_OpenDIYEditPage";
    // 更新DIY卡片選購頁面
    public static StateUpdate_DIYCardSelectionPage = "StateUpdate_DIYCardSelectionPage";
    // 刪除DIY卡片
    public static StateUpdate_DeleteDIYCard = "StateUpdate_DeleteDIYCard";
    // 儲存DIY卡片
    public static StateUpdate_SaveDIYCards = "StateUpdate_SaveDIYCards";
    // 開啟DIY通知確認購買事件
    public static StateUpdate_DIYConfirmPurchase = "StateUpdate_DIYConfirmPurchase";
    // 重置購卡頁面資訊
    public static StateUpdate_CardPurchasePage = "StateUpdate_CardPurchasePage";
    // 發送聊天訊息
    public static StateUpdate_SendChatMessage = "StateUpdate_SendChatMessage";
    // 發送聊天訊息回包
    public static StateUpdate_ReceiveChatMessage = "StateUpdate_ReceiveChatMessage";    
    // 更新當前線上人數
    public static StateUpdate_Online = "StateUpdate_Online";
    // ExtralTime
    public static StateUpdate_ExtralTime = "StateUpdate_ExtralTime";
    // BingoTime
    public static StateUpdate_BingoTime = "StateUpdate_BingoTime"; 
    // 解析度更新
    public static StateUpdate_Canvas = "StateUpdate_Canvas";
}
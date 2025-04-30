import BaseDataManager from "../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent } from "../Tools/EventManager/EventManager";
import BaseCardData from "./card/BaseCardData";
import { GAME_STATUS } from "./CommonData";
const { ccclass } = cc._decorator;

@ccclass
export default class DataManager extends BaseDataManager {
    /** 遊戲狀態 */
    protected gameState: GAME_STATUS = GAME_STATUS.IDLE;
    protected gameStateEvent = {    // 設置對應遊戲狀態
        [GAME_STATUS.IDLE] : (GameStateEvent.GAME_IDLE),
        [GAME_STATUS.BUY] : (GameStateEvent.GAME_BUY),
        [GAME_STATUS.DRAWTHENUMBERS] : (GameStateEvent.GAME_DRAWTHENUMBERS),
        [GAME_STATUS.EXTRABALL] : (GameStateEvent.GAME_EXTRABALL),
        [GAME_STATUS.REWARD] : (GameStateEvent.GAME_REWARD),
    }
    /** 用戶帳戶資訊 */
    protected curBet : number = 1; // 當前下注金額
    protected online : number = 0; //當前在線人數
    /** 卡片數據資料 */
    protected cardPrie : number = 5; // 卡片預設價格
    protected curCard : number = 0; // 當前卡片數量
    protected maxCard : number = 500; // 最大卡片數量
    protected ReadyBuy: number = 0; //準備購買卡片數
    protected cardInfo : BaseCardData[] = []; // 目前擁有的卡片數據資料
    /** 排行版數據資料 */
    protected JackpotNum : number = 0; // Ｊackpot金額

    /** 設置遊戲狀態 */
    public setGameState(state: GAME_STATUS): void {
        this.gameState = state;
        // 取得對應遊戲狀態比廣播
        let event = this.gameStateEvent[this.gameState];
        EventManager.getInstance().emit(event);
    }
    /** 取得遊戲狀態 */
    public getGameState(){
        return this.gameState;
    }
}
import BaseDataManager from "../../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent } from "../../Tools/EventManager/EventManager";
import BaseCardData from "../card/BaseCardData";
import prizeData, { GAME_STATUS } from "../CommonData";
const { ccclass } = cc._decorator;

@ccclass
export default class MegaDataManager extends BaseDataManager {
    /** 遊戲狀態 */
    protected gameState: GAME_STATUS = GAME_STATUS.LOADING;
    protected gameStateEvent = {    // 設置對應遊戲狀態
        [GAME_STATUS.LOADING] : (GameStateEvent.GAME_LOADING),
        [GAME_STATUS.BUY] : (GameStateEvent.GAME_BUY),
        [GAME_STATUS.DRAWTHENUMBERS] : (GameStateEvent.GAME_DRAWTHENUMBERS),
        [GAME_STATUS.REWARD] : (GameStateEvent.GAME_REWARD),
    }
    protected buyTime : number = 0; // 當前下注時間
    /** 用戶帳戶資訊 */
    protected curBet : number = 1; // 當前下注金額
    protected online : number = 0; //當前在線人數
    /** 卡片數據資料 */
    protected cardPrie : number = 5; // 卡片預設價格
    protected curCard : number = 0; // 當前卡片數量
    protected maxCard : number = 500; // 最大卡片數量
    protected readyBuy: number = 0; //準備購買卡片數
    protected cardInfo : BaseCardData[] = []; // 目前擁有的卡片數據資料
    /** 發球資訊 */
    protected currentBallNumber : number;               // 當前球號
    protected currentBallNumberList : number[] = [];    // 當前球號列表
    protected totalBallCount : number = 48;             // 總共發球球數

    protected ballBG : cc.SpriteFrame[] = [];// 球號的背景顏色
    /** 排行版數據資料 */
    protected BingoJackpotAmount : string = ""; // Ｊackpot金額
    protected prizeDataList : prizeData[] = []; // 中獎圖示資料

    /** 設置遊戲狀態 */
    public setGameState(state: GAME_STATUS): void {
        this.gameState = state;
        // 取得對應遊戲狀態比廣播
        let event = this.gameStateEvent[this.gameState];
        EventManager.getInstance().emit(event);
    }

    //#region 取得參數

    /** 取得遊戲狀態 */
    public getGameState(){
        return this.gameState;
    }

    /** 取得目前可下注時間 */
    public getBuyTime() {
        return this.buyTime;
    }

    /** 取得用戶資訊 */
    public getUserData() {
        let data = {
            amount : this.coin,
            coin : 0,
            wallet : 0,
        }
        return data;
    }

    /** 當前線上人數 */
    public getOnline() {
        return this.online;
    }

    /** 取得當前球號 */
    public getCurrentBallNumber(){
        return this.currentBallNumber;
    }

    /** 取得當前球數 */
    public getBallCount(){
        return this.currentBallNumberList.length;
    }

    /** 取得總球數 */
    public getTotalBallCount(){
        return this.totalBallCount;
    }

    /** 取得球號圖片 */
    public getBallBG(ballNum : number){
        if(ballNum <= 15 && ballNum >= 1){
            return this.ballBG[0];
        }else if(ballNum <= 30 && ballNum >= 16){
            return this.ballBG[1];
        }else if(ballNum <= 45 && ballNum >= 31){
            return this.ballBG[2];
        }else if(ballNum <= 60 && ballNum >= 46){
            return this.ballBG[3];
        }else if(ballNum <= 75 && ballNum >= 61){
            return this.ballBG[4];
        }
        return null;
    }

    /** 取得獎池金額 */
    public getBingoJackpotAmount() {
        return this.BingoJackpotAmount;
    }

    /** 取得中獎卡片資訊 */
    public getPrizeDataList() {
        return this.prizeDataList;
    }

    //#endregion

    //#region 參數設定

    /** 設定公用圖片與公用資料 */
    public setInitData(data){
        this.ballBG = data.ballBG;
        this.prizeDataList = data.prizeDataList;
    }

    /** 快照事件 還原當前遊戲狀態 */
    public ServerToSnapshot(data) {

    }

    /** 發球事件 */
    public ServerToBallEvent(data) {
        let num = data.num;
        if (this.currentBallNumberList.includes(num)) {
            console.error("球號重複 Server資訊 Data => ", data);
            return;
        }

        this.currentBallNumber = num;
        this.currentBallNumberList.push(num);
    }

    //#endregion
}
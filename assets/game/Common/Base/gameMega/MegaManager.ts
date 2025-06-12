import { HttpServer } from "../../../bingoMegaH5/script/HttpServer";
import BaseDataManager from "../../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Tools/Base/EventManager";
import { CommonTool } from "../../Tools/CommonTool";
import { PopupName } from "../../Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Tools/PopupSystem/PopupManager";
import ToastManager from "../../Tools/Toast/ToastManager";
import { MathUtils } from "../../Tools/MathUtils";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS } from "../CommonData";
import CardNumberManager from "./CardNumberManager";
import { MegaDataStore } from "./MegaDataStore";
import PageManager from "./PageManager";
import { CardMega } from "../card/CardMega";
const { ccclass } = cc._decorator;

@ccclass
export default class MegaManager extends BaseDataManager {

    private dataStore: MegaDataStore;
    private pageManager: PageManager;
    /** 對應遊戲狀態的事件，用於狀態切換處理 */
    protected gameStateEvent = { 
        [GAME_STATUS.BUY]            : (GameStateEvent.GAME_BUY),
        [GAME_STATUS.DRAWTHENUMBERS] : (GameStateEvent.GAME_DRAWTHENUMBERS),
        [GAME_STATUS.REWARD]         : (GameStateEvent.GAME_REWARD),
    }

    constructor() {
        super();
        this.dataStore = new MegaDataStore();
        this.pageManager = new PageManager(this.dataStore);
    }

    // 初始化快照資訊
    public init() {
        const serverData = window.serverData;
        // 只初始化數據存儲，其他管理器直接從 dataStore 獲取數據
        this.dataStore.initFromServer(serverData);
        // 通知系統快照初始化完成
        EventManager.getInstance().emit(GameStateEvent.GAME_SNAPSHOT);
    }

    /** 設置遊戲狀態 */
    public setGameState(state: GAME_STATUS): void {
        this.dataStore.gameState = state;
        // 取得對應遊戲狀態比廣播
        let event = this.gameStateEvent[this.dataStore.gameState];
        EventManager.getInstance().emit(event);
    }

    /** 設置當前線上人數 */
    public setOnline(data: any) {
        this.dataStore.online = data;
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_Online);
    }

    //#region 取得參數

    /** 取得遊戲狀態 */
    public getGameState(){
        return this.dataStore.gameState;
    }

    /** 取得目前可下注時間 */
    public getBettingTime() {
        return this.dataStore.bettingTime;
    }

    /** 當前線上人數 */
    public getOnline() {
        return (this.dataStore.online).toLocaleString();
    }

    /** 目前玩家金額 */
    public getCoin() {
        return this.dataStore.coin;
    }

    /** 當前貨幣 */
    public getCurrency() {
        return this.dataStore.currency;
    }

    /** 卡片倍率 */
    public getMultiples() {
        return this.dataStore.multiples;
    }

    /** 取得最大購卡數 */
    public getMaxCardCount() {
        return (this.dataStore.maxCardCount - this.dataStore.ownedCards.length)
    }

    /** 是否下注時間 */
    public GameStateBUY () {
        return (this.dataStore.gameState == GAME_STATUS.BUY);
    }

    /** 判斷目前是否是購買DIY卡片 */
    public buyDIYCard () {
        return (this.dataStore.selectedCardContent == CARD_CONTENT.DIY);
    }

    /** 取得當前球號 */
    public getCurrentBallNumber(){
        return this.dataStore.currentBall;
    }

    /** 取得當前球數 */
    public getBallCount(){
        return this.dataStore.currentBallSequence.length;
    }

    /** 取得開出球號列表 */
    public getBallList(){
        return this.dataStore.currentBallSequence;
    }

    /** 取得總球數 */
    public getTotalBallCount(){
        return this.dataStore.totalBallCount;
    }

    /** 取得獎池金額 */
    public getBingoJackpotAmount() {
        return this.dataStore.jackpotAmountDisplay;
    }

    /** 取得中獎卡片資訊 */
    public getPrizeDataList() {
        let showprizeList = [];
        this.dataStore.prizeList.forEach(item => {
            let multiples = (this.dataStore.multiples == 0) ? 5 : this.dataStore.multiples;
            // 使用 MathUtils 精確乘法避免浮點數精度問題
            showprizeList.push(MathUtils.times(item, multiples));
        })
        return showprizeList;
    }

    /** 取得確認購卡頁面的卡片資訊 */
    public getConfirmedCardPurchaseList() {
        return this.dataStore.confirmedPurchaseCards;
    }

    /** 檢查是否要開啟DIY選擇頁面 */
    public CheckOpenDIYCardSelectionPage(){
        if(this.dataStore.selectedCardContent == CARD_CONTENT.DIY){
            return (this.dataStore.selectedDIYCards.length == 0) ? true : false;
        }else{
            return false;
        }
    }

    /** 取得視頻地址 */
    public getVideoUrls() {
        return this.dataStore.videoUrls;
    }

    /** 目前購買實際卡片數量是否為 0 */
    public ActualNumberofCardsPurchased() {
        return (this.dataStore.ownedCards.length == 0)
    }

    public getCardsToBuy = () => this.dataStore.getCardsToBuy();
    public getBuyTotalCard = () => this.dataStore.getBuyTotalCard();
    //#endregion

    //#region 參數設定

    /** 設定玩家金額 */
    public setCoin(coin) {
        this.dataStore.coin = coin;
        EventManager.getInstance().emit(GameStateUpdate.StaticUpdate_Coin);
    }

    /** 設定目前卡片購買類型 */
    public setCardState(state : CARD_STATUS){
        this.dataStore.selectedCardType = state;
    }

    /** 設定目前卡片內容類型 */
    public setCardContent(state : CARD_CONTENT){
        this.dataStore.selectedCardContent = state;
    }

    /** 設定目前要購買的玩法 */
    public setPlayState(state : CARD_GAMEPLAY) {
        this.dataStore.selectedPlayMode = state;
        
        /** 設定預設籌碼編號 */
        if(this.dataStore.multiples == 0) {
            this.dataStore.selectedChipIndex = 1;
        }
    }

    /** 變更當前籌碼 */
    public setCurChipIndex(index : number) {
        this.dataStore.selectedChipIndex = index;
    }

    /** 變更購卡數量 */
    public ChangeReadyBuyValue(value : number) {
        this.dataStore.cardsToBuy += value;
        this.dataStore.cardsToBuy = Math.max(0, Math.min(this.getMaxCardCount(), this.dataStore.getCardsToBuy()));
    }

    /** 設置目前要購買的卡片數量 */
    public setReadyBuy(value : number) {
        this.dataStore.cardsToBuy = value;
        this.dataStore.cardsToBuy = Math.max(0, Math.min(this.getMaxCardCount(), this.dataStore.getCardsToBuy()));
    }

    /** 設定需要編輯的DIY卡片資訊 */
    public OpenDIYEditCard(data) {
        this.dataStore.editableDIYCard = data.data;
        this.dataStore.editableDIYID = data.id;
        HttpServer.DIYCount()
        .then(results => {
            for (const key in results.data) {
                if (results.data.hasOwnProperty(key)) {
                    const numKey = parseInt(key, 10);
                    const value = results.data[key];
                    this.dataStore.ballHitCountMap.set(numKey, value);
                }
            }
            PopupManager.showPopup(PopupName.DIYEditPage, this.pageManager.getDIYEditPageData());
        });
    }

    /** 儲存主播頁面資訊 */
    public setAvatarData(data) {
        this.dataStore.hostAvatarData = data;
    }
        
    //#endregion

    //#region 不同頁面的業務邏輯   
    /** 取得下注頁面相關資訊 */
    public getCardPurchasePageData = () => this.pageManager.getCardPurchasePageData();
    /** 取得確認頁面相關資訊 */
    public getConfirmPurchasePageData = () => this.pageManager.getConfirmPurchasePageData();
    /** 取得已購卡頁面相關資訊 */
    public getPurchasedTicketPageData = () => this.pageManager.getPurchasedTicketPageData();
    /** 44球結算 extra patterns獎勵事件 */
    public getRewardPopupData = () => this.pageManager.getRewardPopupData();
    /** 取得用戶資訊 */
    public getUserPageData = () => this.pageManager.getUserPageData();
    /** 取得個人中心相關資訊 */
    public getPersonalCenterPageData = () => this.pageManager.getPersonalCenterPageData();
    /** 取得總球數頁面資訊 */
    public getAllBallNumbersPageData = ()=> this.pageManager.getAllBallNumbersPageData();
    /** 取得主播頁面資訊 */
    public getAvatarPageData = ()=> this.pageManager.getAvatarPageData();
    /** DIY旋擇頁面資訊 */
    public getDIYCardSelectionPageData = ()=> this.pageManager.getDIYCardSelectionPageData();
    /** 排行榜資訊頁面 */
    public getLeaderboardPageData = () => this.pageManager.getLeaderboardPageData();
    /** 聊天與送禮頁面資訊 */
    public getChatPageData = () => this.pageManager.getChatPageData();
    //#endregion
 
    //#region 遊戲內部交互
    /** 下注檢查 */
    public BetCheck(isChecked) { 
        if (this.CheckOpenDIYCardSelectionPage() && isChecked) {
            this.OpenDIYCardSelectionPage();
            return false;
        }
        if(this.getCardsToBuy() == 0){
            ToastManager.showToast("Card quantity cannot be empty.");
            return false;
        }
        if ((this.getCoin() - this.getBuyTotalCard()) < 0) {
            PopupManager.showPopup(PopupName.BalanceTooLowPage);
            return false;
        }
        this.SendConfirmPurchase();
        return true;
    }

    /** 發送確認購卡請求（亂數卡片 + DIY卡片統一處理） */
    public SendConfirmPurchase() {
        const isNormalCard = this.dataStore.selectedCardContent === CARD_CONTENT.NORMAL;

        const data: any = {
            gameRoundID: this.dataStore.NextGameRound,                // 當局 ID
            cardState: this.dataStore.selectedCardType,               // 卡片類型
            cardContent: isNormalCard ? this.dataStore.selectedCardContent : 1,  // 卡片內容（DIY 固定為 1）
            playState: this.dataStore.selectedPlayMode,               // 玩法
            chipPries: this.dataStore.getChipPrice(),                 // 籌碼金額
        };

        if (isNormalCard) {
            data.readyBuy = this.dataStore.getCardsToBuy();           // 亂數卡片的購買數量
        } else {
            data.cardInfo = this.dataStore.selectedDIYCards;          // DIY 卡片資訊
        }
        CardNumberManager.getInstance().createPurchaseCards(data);
    }

    /** 確認購卡回包(確認頁面) */
    public ConfirmPurchaseResponse(data) {
        this.dataStore.confirmedPurchaseCards = [];
        // 獲取確認購卡頁面的卡片資訊
        for(let i = 0; i < data.length; i++){
            let cardInfo = data[i];
            let card = new CardMega(cardInfo);
            this.dataStore.confirmedPurchaseCards.push(card);
        }
        // 開啟確認夠卡介面
        PopupManager.showPopup(PopupName.ConfirmPurchasePage);
    }

    /** 發送變更隨機卡片內容數據請求 (只限定非DIY卡片內容) */
    public SnedChangeCardData() {
        let data = [];
        for (let i = 0; i < this.dataStore.confirmedPurchaseCards.length; i++) {
            let cardInfo = this.dataStore.confirmedPurchaseCards[i];
            let _data = cardInfo.getChageCardData();
            const cardData = {
                cardId: _data.id,
                numbers: _data.numbers,
                cardState: _data.cardState,
                cardContent: _data.cardContent,
                playState: _data.playState,
            };

            data.push(cardData);
        }
        let newdata = CardNumberManager.getInstance().SnedChangeCardData(data);
        this.dataStore.confirmedPurchaseCards = [];
        // 獲得新版本的卡片內容
        for(let i = 0; i < newdata.length; i++){
            let cardInfo = newdata[i];
            let card = new CardMega(cardInfo);
            this.dataStore.confirmedPurchaseCards.push(card);
        }
        return this.dataStore.confirmedPurchaseCards;
    }

    /** 發送玩家確定購卡(將進入已購卡頁面)  */
    public SendPurchasedCardList() {
        let cards = [];
        this.dataStore.confirmedPurchaseCards.forEach((item) =>{
            let card = {
                "card_detail": item.getCardInfoString(),
                "card_id": item.getID(),
                "gameType": item.getPlayState(),
            }
            cards.push(card);
        });

        let play_code = null;
        switch(this.dataStore.selectedPlayMode) {
            case CARD_GAMEPLAY.COMDO:
                play_code = 103;
                break;
            case CARD_GAMEPLAY.EXTRA:
                play_code = 100;
                break;
            case CARD_GAMEPLAY.JACKPOT:
                play_code = 101;
                break;
        }
        // 傳送請求給伺服器建立卡片
        HttpServer.CardCreate_POST(cards, this.dataStore.getMultiples(), play_code)
        .then(results => {
            this.dataStore.createCardServer(results);
            // 文字提示
            let ToastStr = (this.dataStore.selectedCardContent === CARD_CONTENT.NORMAL) ? "Random card purchased successfully." : "DIY card purchased successfully.";
            ToastManager.showToast(ToastStr);

            this.dataStore.confirmedPurchaseCards = [];
            this.dataStore.selectedDIYCards = [];          // 清除玩家選擇的DIY卡片
            this.dataStore.cardsToBuy = 0;    
            this.dataStore.selectedCardContent = 0;         

            // 開啟已購卡介面
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage);
            EventManager.getInstance().emit(GameStateUpdate.StaticUpdate_Coin);
        });
    }

    /** DIY編輯更新 */
    public DIYCardEditUpdate(data) {
        let id = data.id;
        // 是編輯的DIY卡片
        if(id) {
            // 替換原卡片為新卡片
            const newCardData = {
                cardId: id,
                numbers: data.cardInfo,
            };
            const newCard = new CardMega(newCardData);

            // 替換 DIYCardList 中的卡片
            const diyIndex = this.dataStore.savedDIYCards.findIndex(card => card.getID() === id);
            if (diyIndex !== -1) {
                this.dataStore.savedDIYCards.splice(diyIndex, 1, newCard);
            }
        }else {
            let newCardData = {
                cardId: CardNumberManager.getInstance().generateCardID(),
                numbers: data,
            }
            let newCard = new CardMega(newCardData);
            this.dataStore.savedDIYCards.push(newCard);
        }
    }

    /** DIY刪除 */
    public DIYDelete(data) {
        const diyIndex = this.dataStore.savedDIYCards.findIndex(card => card.getID() === data.id);
        if (diyIndex !== -1) {
            this.dataStore.savedDIYCards.splice(diyIndex, 1);
            ToastManager.showToast("Deleted successfully.");
        } else {

        }
    }

    /** DIY卡片確認購買事件 */
    public DIYConfirmPurchase(data){
        let cardList = [];
        data.forEach((item) => {
            const cardData = {
                cardId: item.id,
                cardState: CARD_CONTENT.DIY,
                playState: item.playState,
                numbers: item.cardInfo,
            };
            cardList.push(cardData);
        });
        this.dataStore.selectedDIYCards = data;
    }

    /** Jackpot中獎金額資訊 */
    public getJackpotAndBingoWinData() {
        let data = {
            Jackpot: this.dataStore.jackpotAmountDisplay,
            Bingo: this.dataStore.bingoAmountDisplay,
            OneTG: this.dataStore.OneTGAmountDisplay,
            TWOTG: this.dataStore.TwoTGAmountDisplay,
        }
        return data;
    }

    /** 發送聊天訊息 */
    public SendChat(message) {
        return {name : this.dataStore.nickname, content : message};
    }

    //#endregion

    //#region Server發送事件

    /** 新局開始 */
    public NewGame(data){
        this.dataStore.GameRoundID = data.game_round_id;
        this.dataStore.NextGameRound = data.next_game_round;

        this.dataStore.currentBall = null;
        this.dataStore.currentBallSequence = [];
        CardNumberManager.getInstance().clearOwnedCards();
        // 檢查玩家當局是否買卡
        let HasTheCurrentPlayerPurchasedCard = (this.dataStore.ownedCards.length > 0);

        // 將預購卡轉為本局卡，其他全部清除
        const nextRoundCards = this.dataStore.ownedCards.filter(card => {
            if (card.getCardState() === CARD_STATUS.PREORDER) {
                card.setCardState(CARD_STATUS.NORMAL);
                CardNumberManager.getInstance().addCard(card.getCardInfo());
                return true;
            }
            return false;
        });

        this.dataStore.ownedCards = nextRoundCards;
        if(this.dataStore.ownedCards.length > 0){
            this.dataStore.currentBetAmount = 0;
        }
        else{
            // 玩家當局有買卡才做購卡頁面數據重置行為
            if(HasTheCurrentPlayerPurchasedCard){
                this.dataStore.cardsToBuy = 0;
                this.dataStore.selectedPlayMode = 0;
                this.dataStore.multiples = 0;
            }
        }
        this.dataStore.selectedCardType = CARD_STATUS.NORMAL;
        this.setGameState(GAME_STATUS.BUY);
    }

    /** 下注結束 */
    public ReawtheNumbers() {
        // 下注結束後變更CardType 變成預購卡
        if(this.dataStore.ownedCards.length == 0)
            this.dataStore.selectedCardType = CARD_STATUS.PREORDER;
        this.dataStore.confirmedPurchaseCards.forEach((card)=>{
            card.setCardState(CARD_STATUS.PREORDER);
        });
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_ExtralTime);
        this.setGameState(GAME_STATUS.DRAWTHENUMBERS);
    }

    /** 獎號進行中 */
    public PrizeOnGoingEvent(data) {
        // 最新開出球號列表
        const prizeNumbers: number[] = this.parsePrizeNumber(data.prize_number);
        // 已儲存的球號列表
        let currentBallSequence = this.dataStore.currentBallSequence;  
        const newBallCount = prizeNumbers.length - currentBallSequence.length;
        if (newBallCount <= 0) return;
        // 抓出尾端新增球
        const newBalls = prizeNumbers.slice(-newBallCount);
        // 更新遊戲內容
        newBalls.forEach((ball) => {
            this.dataStore.currentBall = ball;
            this.dataStore.currentBallSequence.push(ball);
            this.dataStore.ownedCards.forEach((cardItem, index)=>{
                cardItem.updateCard(ball);
            })
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall);
        })

        if(currentBallSequence.length == 44)
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_BingoTime);
    }

    /** 將 prize_number（string）轉為 number[] 陣列 */
    private parsePrizeNumber(input: string | null | undefined): number[] {
        if (Array.isArray(input)) return input;

        if (typeof input === "string" && input.trim() !== "") {
            return input
                .split(",")
                .map(str => parseInt(str.trim(), 10))
                .filter(n => !isNaN(n));
        }

        return []; // 空字串或 null 回傳空陣列
    }

    /** 總結算事件 */
    public ResultComplete(data : any) {
        let PageData = {
            extral : data.extra,
            jackpot: data.jackpot,
            const : this.dataStore.currentBetAmount,
        }
        PopupManager.showPopup(PopupName.ResultPage, PageData);
    }

    /** 遊戲結束重置所有參數 */
    public GameOver() {
        EventManager.getInstance().emit(GameStateEvent.GAME_OVER);
    }

    /** 開啟DIY卡片頁面 */
    public SendDIYCardSelectionPage(showSelectionPage : boolean, DIYCardPageinPersonalCenter : boolean = false) {
        this.dataStore.DIYCardPageinPersonalCenter = DIYCardPageinPersonalCenter;
        // 傳送請求給伺服器DIY卡片收藏內容
        HttpServer.DIYCardList()
        .then(results => {
            let cardList = results.data.list;

            this.dataStore.savedDIYCards = [];
            cardList.forEach((card)=>{
                const sortedNumbers = CommonTool.TransformCardInfo(card.card_detail);
                let id = card.card_id;
                let data = {
                    cardId: id,
                    cardState: null,  
                    cardContent: CARD_CONTENT.DIY,
                    playState: null,  
                    numbers : sortedNumbers,
                }
                let megaCard = new CardMega(data);
                this.dataStore.savedDIYCards.push(megaCard);
            });

            if(showSelectionPage)
                this.OpenDIYCardSelectionPage();
            else
                EventManager.getInstance().emit(GameStateUpdate.StateUpdate_DIYCardSelectionPage, this.getDIYCardSelectionPageData());
        });
    }

    private OpenDIYCardSelectionPage() {
        PopupManager.showPopup(PopupName.DIYCardSelectionPage, this.pageManager.getDIYCardSelectionPageData());
    }
    /**
     * 更新獎池資訊
     * @param data 獎池數據
     */
    public updatePrizePot(data: any) {
        this.dataStore.jackpotAmountDisplay = data.Jackpot;
        this.dataStore.bingoAmountDisplay = data.Bingo;
        // 發送獎池更新事件
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_BingoJackpot);
    }

    // 更新Extral實質排行榜數據
    public updateCurrentEPRanking(data) {
        this.dataStore.currentEPRanking = data;
    }

    // 更新Jackpot實質排行榜數據
    public updateCurrentJPRanking(data) {
        this.dataStore.currentJPRanking = data;
    }

    /** 取得下注歷史紀錄相關資訊 */
    public OpenGameRecord() {
        const now = new Date();
        // 今天結束：23:59:59.999
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // 7 天前：00:00:00.000
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        HttpServer.InfoHistory(sevenDaysAgo.getTime(), endOfToday.getTime(), 4)
        .then(results => {
            PopupManager.showPopup(PopupName.GameRecordPage, results);
        });
    }
    //#endregion
}
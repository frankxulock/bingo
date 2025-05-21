import { HttpServer } from "../../../bingoMegaH5/script/HttpServer";
import BaseDataManager from "../../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Tools/Base/EventManager";
import { PopupName } from "../../Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Tools/PopupSystem/PopupManager";
import ToastManager from "../../Tools/Toast/ToastManager";
import { CardMega } from "../card/CardMega";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS } from "../CommonData";
import CardNumberManager from "./CardNumberManager";
import { MegaDataStore } from "./MegaDataStore";
import PageManager from "./PageManager";
const { ccclass } = cc._decorator;

@ccclass
export default class MegaDataManager extends BaseDataManager {

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

    public getCoin() {
        return this.dataStore.coin;
    }

    public getCurrency() {
        return this.dataStore.currency;
    }

    public getMultiples() {
        return this.dataStore.multiples;
    }

    /** 取得最大購卡數 */
    public getMaxCardCount() {
        return (this.dataStore.maxCardCount - this.dataStore.ownedCards.length)
    }

    /** 判斷目前是否是購買當局卡片 */
    public buyCardThisRound () {
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
            showprizeList.push(item * this.dataStore.multiples);
        })
        return showprizeList;
    }

    /** 取得購卡頁面的購買按鈕是否可用 */
    public getBuyCardButtonAvailability() {
        return this.dataStore.isBuyButtonEnabled;
    }

    /** 取得確認購卡頁面的卡片資訊 */
    public getConfirmedCardPurchaseList() {
        return this.dataStore.confirmedPurchaseCards;
    }

    /** 取得已購卡頁面的卡片資訊 (根據中獎金額>預中獎金額排序>原生排序) */
    public getPurchasedCardList() {
        const withIndex = this.dataStore.ownedCards.map((card, index) => ({
            card,
            index,
            totalWin: card.getTotalWin(),
            preWin: card.getPreTotalWin(),
        }));
    
        withIndex.sort((a, b) => {
            if (b.totalWin !== a.totalWin) {
                return b.totalWin - a.totalWin; // 中獎金額高的排前面
            }
            if (b.preWin !== a.preWin) {
                return b.preWin - a.preWin;     // 預中獎金額高的排前面
            }
            return a.index - b.index;           // 保留原本順序
        });
    
        return withIndex.map(entry => entry.card);
    }

    /** 檢查是否要開啟DIY選擇頁面 */
    public CheckOpenDIYCardSelectionPage(){
        if(this.dataStore.selectedCardContent == CARD_CONTENT.DIY){
            return (this.dataStore.selectedDIYCards.length == 0) ? true : false;
        }else{
            return false;
        }
    }

    public getCardsToBuy = () => this.dataStore.getCardsToBuy();
    public getBuyTotalCard = () => this.dataStore.getBuyTotalCard();
    
    //#endregion

    //#region 參數設定

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
            if(this.dataStore.selectedPlayMode == CARD_GAMEPLAY.COMDO)
                this.dataStore.selectedChipIndex = 0;
            else if(this.dataStore.selectedPlayMode == CARD_GAMEPLAY.EXTRA)
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
        this.dataStore.cardsToBuy = Math.max(1, Math.min(this.getMaxCardCount(), this.dataStore.getCardsToBuy()));
    }

    public setReadyBuy(value : number) {
        this.dataStore.cardsToBuy = value;
        this.dataStore.cardsToBuy = Math.max(1, Math.min(this.getMaxCardCount(), this.dataStore.getCardsToBuy()));
    }

    /** 設定需要編輯的DIY卡片資訊 */
    public setDIYEditCard(data) {
        this.dataStore.editableDIYCard = data;
    }

    /** 儲存主播頁面資訊 */
    public setAvatarData(data) {
        this.dataStore.hostAvatarData = data;
    }
        
    //#endregion

    //#region 不同頁面的業務邏輯
     
    /** 顯示購卡頁面 */
    public showCardPurchasePage = () => this.pageManager.showCardPurchasePage();
    /** 取得下注頁面相關資訊 */
    public getCardPurchasePageData = () => this.pageManager.getCardPurchasePageData();
    /** 取得確認頁面相關資訊 */
    public getConfirmPurchasePageData = () => this.pageManager.getConfirmPurchasePageData();
    /** 取得已購卡頁面相關資訊 */
    public getPurchasedTicketPageData = () => this.pageManager.getPurchasedTicketPageData();
    /** 44球結算 extra patterns獎勵事件 */
    public getRewardPopupData = () => this.pageManager.getRewardPopupData();
    /** 取得結算頁面相關資訊 */
    public getResultPageData = () => this.pageManager.getResultPageData();
    /** 取得用戶資訊 */
    public getUserPageData = () => this.pageManager.getUserPageData();
    /** DIY購卡頁面參數 */
    public getDIYEditPageData =() => this.pageManager.getDIYEditPageData();
    /** 取得個人中心相關資訊 */
    public getPersonalCenterPageData = () => this.pageManager.getPersonalCenterPageData();
    //#endregion

    //#region 與Server交互訊息

    /** 取得目前擁有的卡片號碼 */
    public gethaveCardNumberList() {
        let number = [];
        this.dataStore.ownedCards.forEach((item)=>{
            number.push(item.getCardInfo());
        })
        return number;
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
        // 購卡頁面按鈕恢復成可使用狀態
        this.dataStore.isBuyButtonEnabled = true;
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
        CardNumberManager.getInstance().SnedChangeCardData(data);
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

            this.dataStore.confirmedPurchaseCards = [];
            this.dataStore.selectedDIYCards = [];          // 清除玩家選擇的DIY卡片
            this.dataStore.cardsToBuy = 1;    
            this.dataStore.selectedCardContent = 0;         

            // 文字提示
            let ToastStr = (this.dataStore.selectedCardContent === CARD_CONTENT.NORMAL) ? "随机卡片购买成功" : "DIY卡片购买成功";
            ToastManager.showToast(ToastStr);
            // 開啟已購卡介面
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage);
        });
    }

    /** 發球事件 */
    public ServerToBallEvent(num) {
        if (this.dataStore.currentBallSequence.includes(num)) {
            console.error("球號重複 Server資訊 Data => ", num);
            return;
        }

        this.dataStore.ownedCards.forEach((cardItem, index)=>{
            cardItem.updateCard(num);
        })

        this.dataStore.currentBall = num;
        this.dataStore.currentBallSequence.push(num);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall);
    }

    /** 遊戲結束重置所有參數 */
    public GameOver(buyTime? : number) {
        this.dataStore.bettingTime = (buyTime) ? buyTime : 60;
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
            this.dataStore.selectedCardType = CARD_STATUS.NORMAL;
        }
        else{
            // 玩家當局有買卡才做購卡頁面數據重置行為
            if(HasTheCurrentPlayerPurchasedCard){
                this.dataStore.cardsToBuy = 1;
                this.dataStore.selectedPlayMode = 0;
            }
        }
        EventManager.getInstance().emit(GameStateEvent.GAME_OVER);
    }

    /** DIY購卡頁面參數 */
    public getDIYCardSelectionData() {
        // 取得目前已經購買的 DIY 卡片
        const DIYCard = this.dataStore.ownedCards.filter(card => {
            return (card.getCardContent() === CARD_CONTENT.DIY);
        });
        // 建立卡片資料並加上是否已選擇（給 UI 用），並把已購買的卡片排後面
        const listData = this.dataStore.savedDIYCards
            .map(card => {
                const isPurchased = DIYCard.some(c => c.getID() === card.getID());
                return {
                    ...card,
                    isPurchased,
                    isSelected: false,
                };
            })
            .sort((a, b) => Number(a.isPurchased) - Number(b.isPurchased));

        let data = {
            DIYmaxCard: this.dataStore.maxDIYCardCount,      // 同時收藏最多DIY卡片數量
            listData: listData,               // UI使用卡片
        };
        return data;
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
            ToastManager.showToast("刪除OK");
        } else {
            console.error("找不到要刪除的DIY卡片資訊 data => ", data);
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

    /** 測試用 新增收藏DIY卡片 */
    public setDIYCardList(data) {
        this.dataStore.savedDIYCards = data;
    }

    /** 測試用 新增收藏DIY卡片 */
    public setballNumberWinMap(data) {
        this.dataStore.ballHitCountMap = data;
    }

    /** 取得主播頁面資訊 */
    public getAvatarData() {
        return this.dataStore.hostAvatarData;
    }

    /** 取得總球數頁面資訊 */
    public getAllBallNumbersData() {
        let data = {
            ballList : this.dataStore.currentBallSequence,
            // tableId : this.dataStore.gameID,
        }
        return data;
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

    /** 儲存排行本頁面資訊 */
    public setLeaderboardData(data) {
        this.dataStore.currentJPRanking = data.JPRanking;
        this.dataStore.historicalJPRanking = data.JPHistory;
        this.dataStore.historicalEPRanking = data.EPHistory;
        this.dataStore.currentEPRanking = data.EPRanking;
    }
    /** 排行榜資訊頁面 */
    public getLeaderboardData() {
        let data = {
            JPRanking : this.dataStore.currentJPRanking,   // 當局Jackpot榜單
            JPHistory : this.dataStore.historicalJPRanking,   // 歷史中獎Jackpot榜單
            EPRanking : this.dataStore.currentEPRanking,   // 當局額外球榜單
            EPHistory : this.dataStore.historicalEPRanking,   // 歷史中獎額外球榜單
        }
        return data;
    }

    /** 請求目前有的聊天記錄 */
    public getChatPage() {
        let data = [
            {name : "Caler", content : "test"},
            {name : "Caler1", content : "test1"},
            {name : "Caler2", content : "test2"},
            {name : "Caler3", content : "test3"},
        ];
        return data;
    }

    /** 發送聊天訊息 */
    public SendChat(message) {
        return {name : this.dataStore.nickname, content : message};
    }

    /** 取得個人中心頁面資訊 */
    public getPersonalCenterPage() {
        let data = {
            nickName : this.dataStore.nickname,
            id : "1151512323",
            coin : this.dataStore.coin,   
        }
        return data;
    }

    //#endregion
}
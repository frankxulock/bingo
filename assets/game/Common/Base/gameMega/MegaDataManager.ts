import UnitTest from "../../../UnitTest";
import BaseDataManager from "../../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Tools/Base/EventManager";
import PopupManager from "../../Tools/PopupSystem/PopupManager";
import { PopupName } from "../../Tools/PopupSystem/PopupConfig";
import ToastManager from "../../Tools/Toast/ToastManager";
import { CardMega } from "../card/cardMega";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS } from "../CommonData";
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
    protected gameRoundID : number = 0; // 遊戲當局ID
    /** 用戶帳戶資訊 */
    protected curBet : number = 1; // 當前下注金額
    protected online : number = 0; //當前在線人數
    /** 卡片數據資料 */
    protected cardState : CARD_STATUS = CARD_STATUS.NORMAL;             // 目前選擇購買卡片類型    當局／下局卡（預購卡）      
    protected cardContent : CARD_CONTENT = CARD_CONTENT.NORMAL;         // 目前卡片的內容         隨機/DIY   
    protected playState : CARD_GAMEPLAY = CARD_GAMEPLAY.COMDO;          // 目前選擇的玩法
    protected combo_ChipList : number[] = [10, 25, 55, 105, 205, 505];  // combo籌碼列表
    protected extra_ChipList : number[] = [5, 20, 50, 100, 200, 500];   // extra籌碼列表
    protected jackpot_Chip : number = 5;                                // jackpot購買籌碼
    protected curChipIndex : number = 0;    // 目前玩家選擇的籌碼編號
    protected readyBuy: number = 1;         // 準備購買卡片數
    protected maxCard : number = 500;       // 最大卡片數量
    protected DIYmaxCard : number = 60;     // 同時收藏最多DIY卡片數量
    protected DIYEditCard: any;             // 需要編輯的DIY卡片
    protected DIYCardList : CardMega[] = [];                // 玩家已經收藏的DIY卡片內容
    protected DIYSelectedCardList : CardMega[] = [];        // 玩家目前選中的DIY卡片
    protected ConfirmedCardPurchaseList : CardMega[] = [];  // 確認購卡的卡片資訊內容
    protected PurchasedCardList : CardMega[] = [];          // 目前擁有的卡片數據資料
    /** 球號資訊 */
    protected ballNumberWinMap: Map<number, number> = new Map();    // 每個球號已經中過的次數記錄
    protected hotBalls: any[] = [];
    protected coldBalls: any[] = [];
    protected normalBalls: any[] = [];
    /** 發球資訊 */
    protected currentBallNumber : number = null;        // 當前球號
    protected currentBallNumberList : number[] = [];    // 當前球號列表
    protected totalBallCount : number = 49;             // 總共發球球數
    protected ballBG : cc.SpriteFrame[] = [];           // 球號的背景顏色
    protected winnerItem : any[] = [];                  // 已經中獎項目
    protected pendingWinnerItem : any[] = [];           // 即將中獎項目
    /** 排行版數據資料 */
    protected BingoJackpotAmount : string = ""; // Ｊackpot金額
    protected prizeDataList = [5.5, 5.5, 10, 27.5, 57.5, 57.5, 150, 1000, 1800, 20000]; // 中獎金額
    protected JPRanking : any = null;   // 當局Jackpot榜單
    protected JPHistory : any = null;   // 歷史中獎Jackpot榜單
    protected EPRanking : any = null;   // 當局額外球榜單
    protected EPHistory : any = null;   // 歷史中獎額外球榜單
    /** 主播頁面資訊 */
    protected AvatarData : any;
    /** 頁面相關的控制資訊 */
    protected buyCardButtonAvailability : boolean = true;   // 購卡頁面按鈕事件是否可以觸發

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

    /** 當前線上人數 */
    public getOnline() {
        return this.online;
    }

    /** 取得不同玩法的籌碼列表 */
    public getChipList() {
        if(this.playState == CARD_GAMEPLAY.COMDO)
            return this.combo_ChipList;
        else if(this.playState == CARD_GAMEPLAY.EXTRA)
            return this.extra_ChipList;
        else
            return null;
    }

    /** 取得玩家要購買卡片的總金額 */
    public getBuyTotalCard() {
        let chipList = this.getChipList();      // 籌碼列表
        let buyCoin = 0;
        if(chipList != null)
            buyCoin = (chipList[this.curChipIndex] * this.getReadyBuy());
        else 
            buyCoin = this.jackpot_Chip * this.getReadyBuy();
        return buyCoin;
    }

    /** 當前購買卡片數量 */
    public getReadyBuy() {
        if(this.cardContent == CARD_CONTENT.NORMAL)
            return this.readyBuy;
        else 
            return this.DIYSelectedCardList.length;
    }

    /** 判斷目前是否是購買當局卡片 */
    public buyCardThisRound () {
        return (this.gameState == GAME_STATUS.BUY);
    }

    /** 判斷目前是否是購買DIY卡片 */
    public buyDIYCard () {
        return (this.cardContent == CARD_CONTENT.DIY);
    }

    /** 取得當前球號 */
    public getCurrentBallNumber(){
        return this.currentBallNumber;
    }

    /** 取得當前球數 */
    public getBallCount(){
        return this.currentBallNumberList.length;
    }

    /** 取得開出球號列表 */
    public getBallList(){
        return this.currentBallNumberList;
    }

    /** 取得總球數 */
    public getTotalBallCount(){
        return this.totalBallCount;
    }

    /** 取得獎池金額 */
    public getBingoJackpotAmount() {
        return this.BingoJackpotAmount;
    }

    /** 取得中獎卡片資訊 */
    public getPrizeDataList() {
        return this.prizeDataList;
    }

    /** 取得購卡頁面的購買按鈕是否可用 */
    public getBuyCardButtonAvailability() {
        return this.buyCardButtonAvailability;
    }

    /** 取得確認購卡頁面的卡片資訊 */
    public getConfirmedCardPurchaseList() {
        return this.ConfirmedCardPurchaseList;
    }

    /** 取得已購卡頁面的卡片資訊 (根據中獎金額>預中獎金額排序>原生排序) */
    public getPurchasedCardList() {
        const withIndex = this.PurchasedCardList.map((card, index) => ({
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

    public CheckOpenDIYCardSelectionPage(){
        if(this.cardContent == CARD_CONTENT.DIY){
            return (this.DIYSelectedCardList.length == 0) ? true : false;
        }else{
            return false;
        }
    }

    //#endregion

    //#region 參數設定

    /** 設定目前卡片購買類型 */
    public setCardState(state : CARD_STATUS){
        this.cardState = state;
    }

    /** 設定目前卡片內容類型 */
    public setCardContent(state : CARD_CONTENT){
        this.cardContent = state;
    }

    /** 設定目前要購買的玩法 */
    public setPlayState(state : CARD_GAMEPLAY) {
        this.playState = state;
        
        /** 設定預設籌碼編號 */
        if(this.playState == CARD_GAMEPLAY.COMDO)
            this.curChipIndex = 0;
        else if(this.playState == CARD_GAMEPLAY.EXTRA)
            this.curChipIndex = 1;
    }

    /** 變更當前籌碼 */
    public setCurChipIndex(index : number) {
        this.curChipIndex = index;
    }

    /** 變更購卡數量 */
    public ChangeReadyBuyValue(value : number) {
        this.readyBuy += value;
        let maxCard = (this.maxCard - this.PurchasedCardList.length);
        this.readyBuy = Math.max(1, Math.min(maxCard, this.getReadyBuy()));
    }

    /** 設定需要編輯的DIY卡片資訊 */
    public setDIYEditCard(data) {
        this.DIYEditCard = data;
    }

    /** 儲存主播頁面資訊 */
    public setAvatarData(data) {
        this.AvatarData = data;
    }
        
    //#endregion

    //#region 不同頁面的業務邏輯
     
    // 避免某些資料沒有 Client自行設定
    public DefaultData() {
        this.currency = "₱";
    }

    // 快照資料處理
    public setSnapshot(data) {
        this.nickname = data.nickName;
        this.coin = data.coin;
        this.currency = data.currency;
        this.gameState = data.gameState;
        this.buyTime = data.buyTime;
        this.currentBallNumberList = data.ballList;
        this.PurchasedCardList = data.cardInfo;
        this.BingoJackpotAmount = data.BingoJackpotAmount;
        this.online = data.online;
        this.ballNumberWinMap = data.ballNumberWinMap;
    }

    /** 檢查展示購卡或是已購卡頁面 */
    public showCardPurchasePage() {     
        return (this.PurchasedCardList.length == 0)
    }

    /** 取得下注頁面相關資訊 */
    public getCardPurchasePageData() {
        let data = {
            playState : this.playState,                                 // 玩法類型
            curChipIndex : this.curChipIndex,                           // 目前玩家選擇的籌碼編號
            chipList : this.getChipList(),                              // 籌碼列表
            playCombo : (this.playState == CARD_GAMEPLAY.COMDO),        // 是COMDO玩法 
            playJackpot : (this.playState == CARD_GAMEPLAY.JACKPOT),    // 是BingoJackpot玩法
        }
        return data;
    }

    /** 取得確認頁面相關資訊 */
    public getConfirmPurchasePageData() {
        // 取得卡片售賣金額與玩法類型名稱
        let cardsPrice = this.getChipPrice();
        let gameTypeStr = "";
        if(this.playState == CARD_GAMEPLAY.COMDO) {
            gameTypeStr = "Comdo";
        }
        else if(this.playState == CARD_GAMEPLAY.EXTRA) {
            gameTypeStr = "extra";
        }
        else {
            gameTypeStr = "B$J";
        }
        // 是不是DIY類型的買卡
        let isDIYType = (this.cardContent == CARD_CONTENT.DIY);
        // 設定購買卡片類型的文字
        let cardTypeStr = isDIYType ? "DIY cards" : "Random cards";

        let data = {
            isDIYType : (this.cardContent == CARD_CONTENT.DIY),            // 是不是DIY類型的買卡
            cardTypeStr : cardTypeStr,                                  // 卡片類型文字
            gameTypeStr : gameTypeStr,                                  // 玩法類型文字
            cardsPriceStr : (this.currency + cardsPrice),                  // 卡片售價金額
            numberOfCardStr : ("X" + this.getReadyBuy()),                       // 購買卡片數量
            totalAmountStr : (this.currency + this.getBuyTotalCard()),     // 卡片總金額
        }
        return data;
    }

    /** 取得下注籌碼金額 */
    public getChipPrice() {
        if(this.playState == CARD_GAMEPLAY.COMDO) {
            return this.combo_ChipList[this.curChipIndex];
        }
        else if(this.playState == CARD_GAMEPLAY.EXTRA) {
            return this.extra_ChipList[this.curChipIndex];
        }
        else {
            return this.jackpot_Chip;
        }
    }

    /** 取得已購卡頁面相關資訊 */
    public getPurchasedTicketPageData() {
        /** 計算總贏分與預中獎列表 */
        let totalWin = 0;
        let rewardMap: { [reward: number]: number[] } = {};  // 用金額分類球號
        let PreItems: { reward: number, numbers: number[] }[] = [];
        
        this.PurchasedCardList.forEach((card) => {
            totalWin += card.getTotalWin();
            const preData = card.getPreData();
        
            preData.forEach((preCardData) => {
                if (!rewardMap[preCardData.reward]) {
                    rewardMap[preCardData.reward] = [];
                }
                if (!rewardMap[preCardData.reward].includes(preCardData.number)) {
                    rewardMap[preCardData.reward].push(preCardData.number);
                }
            });
        });
        
        // 將 map 整理成陣列並排序
        for (const rewardStr in rewardMap) {
            const reward = Number(rewardStr);
            const numbers = rewardMap[reward].filter(n => typeof n === 'number'); // 確保是有效數字
            if (numbers.length > 0) {
                PreItems.push({ reward, numbers });
            }
        }
        // 金額由高至低排序
        PreItems.sort((a, b) => b.reward - a.reward);
 
        // 底部欄位展示內容( 0:可以購買當局卡,1:可以購買預購卡,2顯示已經中獎金額,3:不展示 )
        let BottomBtnState = 3;
        if(this.gameState == GAME_STATUS.BUY || this.gameState == GAME_STATUS.GAMEOVER) {
            BottomBtnState = (this.PurchasedCardList.length < 500) ? 0 : 3;
        }else {
            if(this.cardState == CARD_STATUS.PREORDER) {
                if(this.PurchasedCardList.length < 500)
                    BottomBtnState = 1;
            }else {
                if(totalWin > 0)
                    BottomBtnState = 2;
            }
        }

        let d = {
            pendingWinnerItem: PreItems,                    // 即將中獎內容列表
            BottomBtnState: BottomBtnState,                 // 下方顯示列表
            totalWin : totalWin,                            // 總贏分
        }

        return d;
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

    //#endregion

    //#region 與Server交互訊息

    /** 發送確認購卡請求(確認頁面) 亂數卡片 */
    public SendConfirmPurchase() {
        if(this.cardContent == CARD_CONTENT.NORMAL) {
            let data = {
                gameRoundID : this.gameRoundID,         // 當局ID
                cardState : this.cardState,             // 卡片類型
                cardContent: this.cardContent,          // 卡片內容
                playState : this.playState,             // 玩法類型
                chipPries : this.getChipPrice(),        // 籌碼金額
                readyBuy : this.getReadyBuy(),               // 購買數量
            }
            UnitTest.instance.SimulationData_OpenConfirm(data);
        }else {
            let data = {
                gameRoundID : this.gameRoundID,         // 當局ID
                cardState : this.cardState,             // 卡片類型
                cardContent: 1,                         // 卡片內容
                playState : this.playState,             // 玩法類型
                chipPries : this.getChipPrice(),        // 籌碼金額
                cardInfo : this.DIYSelectedCardList,    // 玩家選擇的DIY卡片
            }
            UnitTest.instance.DIYData_OpenConfirm(data);
        }
    }

    /** 確認購卡回包(確認頁面) */
    public ConfirmPurchaseResponse(data) {
        this.ConfirmedCardPurchaseList = [];
        // 獲取確認購卡頁面的卡片資訊
        for(let i = 0; i < data.length; i++){
            let cardInfo = data[i];
            let card = new CardMega(cardInfo);
            this.ConfirmedCardPurchaseList.push(card);
        }
        // 購卡頁面按鈕恢復成可使用狀態
        this.buyCardButtonAvailability = true;
        // 開啟確認夠卡介面
        PopupManager.showPopup(PopupName.ConfirmPurchasePage);
    }

    /** 發送變更隨機卡片內容數據請求 (只限定非DIY卡片內容) */
    public SnedChangeCardData() {
        let data = [];
        for (let i = 0; i < this.ConfirmedCardPurchaseList.length; i++) {
            let cardInfo = this.ConfirmedCardPurchaseList[i];
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
        UnitTest.instance.SnedChangeCardData(data);
    }

    /** 發送玩家確定購卡(將進入已購卡頁面)  */
    public SendPurchasedCardList() {
        let data = {
            gameRoundID: this.gameRoundID,
            cardInfo: this.ConfirmedCardPurchaseList,
        }
        UnitTest.instance.SendPurchaseConfirmation(data);
    }

    /** 發送玩家確定購卡回包  */
    public SendPurchasedCardListResponse(data) {
        this.ConfirmedCardPurchaseList = [];
        this.DIYSelectedCardList = [];          // 清除玩家選擇的DIY卡片
        this.readyBuy = 1;    
        this.cardContent = 0;         

        // 檢查是否已存在相同 ID 的卡片
        data.forEach(newCard => {
            const exists = this.PurchasedCardList.some(card => card.getID() === newCard.id);
            // 若不存在，加入列表
            if (!exists) {
                this.PurchasedCardList.push(newCard);
            }
        });

        // 文字提示
        let ToastStr = (this.cardContent === CARD_CONTENT.NORMAL) ? "随机卡片购买成功" : "DIY卡片购买成功";
        ToastManager.showToast(ToastStr);
        // 開啟已購卡介面
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage);
    }

    /** 發球事件 */
    public ServerToBallEvent(num) {
        if (this.currentBallNumberList.includes(num)) {
            console.error("球號重複 Server資訊 Data => ", num);
            return;
        }

        this.PurchasedCardList.forEach((cardItem, index)=>{
            cardItem.updateCard(num);
        })

        this.currentBallNumber = num;
        this.currentBallNumberList.push(num);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall);
    }

    /** 44球結算 extra patterns獎勵事件 */
    public getRewardPopupData() {
        let data = {
            win : 0,
        }
        return data;
    }

    /** 取得結算頁面相關資訊 */
    public getResultPageData() {
        let data = {
            cost : 0,       // 成本
            extral : 1,     // extral玩法贏分
            jackpot : 1,    // Jackpot玩法贏分
            total : 0,      // 總贏分
        }
        return data;
    }

    /** 遊戲結束重置所有參數 */
    public GameOver(buyTime? : number) {
        this.buyTime = (buyTime) ? buyTime : 60;
        this.currentBallNumber = null;
        this.currentBallNumberList = [];
        // 檢查玩家當局是否買卡
        let HasTheCurrentPlayerPurchasedCard = (this.PurchasedCardList.length > 0);

        // 將預購卡轉為本局卡，其他全部清除
        const nextRoundCards = this.PurchasedCardList.filter(card => {
            if (card.getCardState() === CARD_STATUS.PREORDER) {
                card.setCardState(CARD_STATUS.NORMAL);
                return true;
            }
            return false;
        });
        cc.log("遊戲結束重置遊戲內容");
        this.PurchasedCardList = nextRoundCards;
        if(this.PurchasedCardList.length > 0){
            this.cardState = CARD_STATUS.NORMAL;
        }
        else{
            // 玩家當局有買卡才做購卡頁面數據重置行為
            if(HasTheCurrentPlayerPurchasedCard){
                this.readyBuy = 1;
                this.playState = 0;
            }
        }
        EventManager.getInstance().emit(GameStateEvent.GAME_OVER);
    }

    /** DIY購卡頁面參數 */
    public getDIYCardSelectionData() {
        // 取得目前已經購買的 DIY 卡片
        const DIYCard = this.PurchasedCardList.filter(card => {
            return (card.getCardContent() === CARD_CONTENT.DIY);
        });
        // 建立卡片資料並加上是否已選擇（給 UI 用），並把已購買的卡片排後面
        const listData = this.DIYCardList
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
            DIYmaxCard: this.DIYmaxCard,      // 同時收藏最多DIY卡片數量
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
            const diyIndex = this.DIYCardList.findIndex(card => card.getID() === id);
            if (diyIndex !== -1) {
                this.DIYCardList.splice(diyIndex, 1, newCard);
            }
        }else {
            let newCardData = {
                cardId: UnitTest.generateCardID(),
                numbers: data,
            }
            let newCard = new CardMega(newCardData);
            this.DIYCardList.push(newCard);
        }
    }

    /** DIY刪除 */
    public DIYDelete(data) {
        const diyIndex = this.DIYCardList.findIndex(card => card.getID() === data.id);
        if (diyIndex !== -1) {
            this.DIYCardList.splice(diyIndex, 1);
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
        this.DIYSelectedCardList = data;
    }

    /** 測試用 新增收藏DIY卡片 */
    public setDIYCardList(data) {
        this.DIYCardList = data;
    }

    /** DIY購卡頁面參數 */
    public getDIYEditData() {
        let ballDisplayInfo = this.getBallDisplayInfo();
        let data = {
            ballDisplayInfo : ballDisplayInfo,    // 球號中獎資訊
            editCard: this.DIYEditCard,                     // 要編輯的卡片資訊
            hotBalls: this.hotBalls,                        // 熱卡
            coldBalls: this.hotBalls,                       // 冷卡
            normalBalls: this.normalBalls,                  // 正常卡
        }
        return data;
    }

    /** 測試用 新增收藏DIY卡片 */
    public setballNumberWinMap(data) {
        this.ballNumberWinMap = data;
    }

    protected getBallDisplayInfo(): any[] {
        const hotBalls: any[] = [];
        const coldBalls: any[] = [];
        const normalBalls: any[] = [];

        this.hotBalls = [];
        this.coldBalls = [];
        this.normalBalls = [];
    
        this.ballNumberWinMap.forEach((num, index)=> {
            let ballNumber = index;
            if (num > 75) {
                this.hotBalls.push(ballNumber);
                hotBalls.push({ ballNumber, winCount: num, color: "red", ratio: 1 });
            } else if (num < 50) {
                this.coldBalls.push(ballNumber);
                coldBalls.push({ ballNumber, winCount: num, color: "blue", ratio: 1 });
            } else {
                this.normalBalls.push(ballNumber);
                normalBalls.push({ ballNumber, winCount: num, color: "gray", ratio: 1 });
            }
        })
    
        this.assignRatio(hotBalls);
        this.assignRatio(coldBalls);
        this.assignRatio(normalBalls);

        return [...hotBalls, ...coldBalls, ...normalBalls].sort((a, b) => a.ballNumber - b.ballNumber);
    }
    
    protected assignRatio(group: any[]): void {
        if (group.length === 0) return;
    
        const max = Math.max(...group.map(b => b.winCount));
        const min = Math.min(...group.map(b => b.winCount));
    
        for (const ball of group) {
            if (max === min) {
                ball.ratio = 1; // 全部相同則為滿條
            } else {
                // 線性比例映射到 0.1 ~ 1 之間
                ball.ratio = 0.1 + 0.9 * ((ball.winCount - min) / (max - min));
            }
        }
    }

    /** 取得主播頁面資訊 */
    public getAvatarData() {
        return this.AvatarData;
    }

    /** 取得總球數頁面資訊 */
    public getAllBallNumbersData() {
        let data = {
            ballList : this.currentBallNumberList,
            tableId : this.gameID,
        }
        return data;
    }

    /** Jackpot中獎金額資訊 */
    public getJackpotAndBingoWinData() {
        let data = {
            Jackpot : 0,
            Bingo: 0,
            OneTG: 0,
            TWOTG: 0,
        }
        return data;
    }

    /** 儲存排行本頁面資訊 */
    public setLeaderboardData(data) {
        this.JPRanking = data.JPRanking;
        this.JPHistory = data.JPHistory;
        this.EPHistory = data.EPHistory;
        this.EPRanking = data.EPRanking;
    }
    /** 排行榜資訊頁面 */
    public getLeaderboardData() {
        let data = {
            JPRanking : this.JPRanking,   // 當局Jackpot榜單
            JPHistory : this.JPHistory,   // 歷史中獎Jackpot榜單
            EPRanking : this.EPRanking,   // 當局額外球榜單
            EPHistory : this.EPHistory,   // 歷史中獎額外球榜單
        }
        return data;
    }

    //#endregion
}
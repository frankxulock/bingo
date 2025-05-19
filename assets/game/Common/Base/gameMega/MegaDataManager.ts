import { HttpServer } from "../../../bingoMegaH5/script/HttpServer";
import BaseDataManager from "../../Tools/Base/BaseDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Tools/Base/EventManager";
import { PopupName } from "../../Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Tools/PopupSystem/PopupManager";
import ToastManager from "../../Tools/Toast/ToastManager";
import { CardMega } from "../card/CardMega";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS } from "../CommonData";
import CardNumberManager from "./CardNumberManager";
const { ccclass } = cc._decorator;

@ccclass
export default class MegaDataManager extends BaseDataManager {

    /** 遊戲當前狀態（如加載中、購卡、開獎、領獎） */
    protected gameState: GAME_STATUS = GAME_STATUS.LOADING;
    /** 對應遊戲狀態的事件，用於狀態切換處理 */
    protected gameStateEvent = { 
        [GAME_STATUS.BUY]            : (GameStateEvent.GAME_BUY),
        [GAME_STATUS.DRAWTHENUMBERS] : (GameStateEvent.GAME_DRAWTHENUMBERS),
        [GAME_STATUS.REWARD]         : (GameStateEvent.GAME_REWARD),
    }
    /** 對應server遊戲狀態的事件，用於狀態切換處理 */
    protected serverStateEvent = {
        "begin"                      : GAME_STATUS.BUY,
        "prize_on_going"             : GAME_STATUS.DRAWTHENUMBERS,
        "wait_prize"                 : GAME_STATUS.REWARD,
    }

    /** 當前下注倒數時間（秒） */
    protected bettingTime : number = 0;

    /** 當前遊戲局號 */
    protected GameRoundID : string = "";
    /** 下局遊戲局號 */
    protected NextGameRound : string = "";

    /** 當前玩家下注金額 */
    protected currentBetAmount : number = 1;

    /** 當前在線玩家數 */
    protected online : number = 0;
    
    /** 當前選擇的卡片類型（本局／下局卡） */
    protected selectedCardType    : CARD_STATUS = CARD_STATUS.NORMAL;
    /** 當前選擇的卡片內容類型（隨機／自定義） */
    protected selectedCardContent : CARD_CONTENT = CARD_CONTENT.NORMAL; 
    /** 當前選擇的玩法類型（例如 Combo、Extra 等） */
    protected selectedPlayMode : CARD_GAMEPLAY = CARD_GAMEPLAY.COMDO;

    /** Combo 模式可選籌碼數額 */
    protected comboChips : number[] = [10, 25, 55, 105, 205, 505];
    /** Extra 模式可選籌碼數額 */
    protected extraChips : number[] = [5, 20, 50, 100, 200, 500];
    /** 購買 Jackpot 的籌碼金額 */
    protected jackpotChipCost : number = 5;
    /** 玩家目前選擇的籌碼索引 */
    protected selectedChipIndex : number = 0;

    /** 玩家準備購買的卡片數量 */
    protected cardsToBuy: number = 1;
    /** 每局最多可購買的卡片數量 */
    protected maxCardCount : number = 500;
    /** 可收藏的 DIY 卡片最大數量 */
    protected maxDIYCardCount : number = 60;

    /** 當前正在編輯的 DIY 卡片物件 */
    protected editableDIYCard: any; 
    /** 玩家收藏的 DIY 卡片清單 */
    protected savedDIYCards : CardMega[] = [];
    /** 玩家目前選中的 DIY 卡片清單 */
    protected selectedDIYCards : CardMega[] = [];
    /** 已確認購買的卡片清單 */
    protected confirmedPurchaseCards : CardMega[] = [];
    /** 玩家已擁有的所有卡片資料 */
    protected ownedCards : CardMega[] = [];

    /** 記錄每個號碼已開出的次數，用於統計冷熱門號碼 */
    protected ballHitCountMap: Map<number, number> = new Map();
    /** 熱門號碼（開出75次數以上） */
    protected hotBallList: any[] = [];
    /** 冷門號碼（開出50次數以下） */
    protected coldBallList: any[] = [];
    /** 正常號碼（開出50-75次數） */
    protected normalBallList: any[] = [];

    /** 當前正在開出的號碼 */
    protected currentBall : number = null;
    /** 當前所有已開出的號碼清單 */
    protected currentBallSequence : number[] = [];
    /** 每輪最多開出的球數 */
    protected totalBallCount : number = 49;

    /** 已經中獎的項目 */
    protected awardedItems : any[] = [];
    /** 預計即將中獎的項目 */
    protected pendingAwardItems : any[] = [];

    /** 顯示中的 Jackpot 金額字串 */
    protected jackpotAmountDisplay : string = "";
    /** 顯示中的 Jackpot 金額字串 */
    protected bingoAmountDisplay : string = "";
    /** 顯示中的 1TG 金額字串 */
    protected OneTGAmountDisplay : string = "";
    /** 顯示中的 2TG 金額字串 */
    protected TwoTGAmountDisplay : string = "";
    /** 不同中獎等級的額外玩法獎金清單 */
    protected prizeList = [];
    /** 當局的 Jackpot 排行榜資料 */
    protected currentJPRanking : any = null;
    /** 歷史的 Jackpot 排行榜資料 */
    protected historicalJPRanking : any = null;
    /** 當局的 Extra Ball 排行榜資料 */
    protected currentEPRanking : any = null;
    /** 歷史的 Extra Ball 排行榜資料 */
    protected historicalEPRanking : any = null;

    /** 主播頭像與資訊資料 */
    protected hostAvatarData : any;

    /** 購卡按鈕是否可用 */
    protected isBuyButtonEnabled : boolean = true;   // 購卡頁面按鈕事件是否可以觸發

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
    public getBettingTime() {
        return this.bettingTime;
    }

    /** 當前線上人數 */
    public getOnline() {
        return (this.online).toLocaleString();
    }

    /** 取得不同玩法的籌碼列表 */
    public getChipList() {
        if(this.selectedPlayMode == CARD_GAMEPLAY.COMDO)
            return this.comboChips;
        else if(this.selectedPlayMode == CARD_GAMEPLAY.EXTRA)
            return this.extraChips;
        else
            return null;
    }

    /** 取得玩家要購買卡片的總金額 */
    public getBuyTotalCard() {
        let chipList = this.getChipList();      // 籌碼列表
        let buyCoin = 0;
        if(chipList != null)
            buyCoin = (chipList[this.selectedChipIndex] * this.getCardsToBuy());
        else 
            buyCoin = this.jackpotChipCost * this.getCardsToBuy();
        return buyCoin;
    }

    /** 當前購買卡片數量 */
    public getCardsToBuy() {
        if(this.selectedCardContent == CARD_CONTENT.NORMAL)
            return this.cardsToBuy;
        else 
            return this.selectedDIYCards.length;
    }

    /** 取得最大購卡數 */
    public getMaxCardCount() {
        return (this.maxCardCount - this.ownedCards.length)
    }

    /** 判斷目前是否是購買當局卡片 */
    public buyCardThisRound () {
        return (this.gameState == GAME_STATUS.BUY);
    }

    /** 判斷目前是否是購買DIY卡片 */
    public buyDIYCard () {
        return (this.selectedCardContent == CARD_CONTENT.DIY);
    }

    /** 取得當前球號 */
    public getCurrentBallNumber(){
        return this.currentBall;
    }

    /** 取得當前球數 */
    public getBallCount(){
        return this.currentBallSequence.length;
    }

    /** 取得開出球號列表 */
    public getBallList(){
        return this.currentBallSequence;
    }

    /** 取得總球數 */
    public getTotalBallCount(){
        return this.totalBallCount;
    }

    /** 取得獎池金額 */
    public getBingoJackpotAmount() {
        return this.jackpotAmountDisplay;
    }

    /** 取得中獎卡片資訊 */
    public getPrizeDataList() {
        return this.prizeList;
    }

    /** 取得購卡頁面的購買按鈕是否可用 */
    public getBuyCardButtonAvailability() {
        return this.isBuyButtonEnabled;
    }

    /** 取得確認購卡頁面的卡片資訊 */
    public getConfirmedCardPurchaseList() {
        return this.confirmedPurchaseCards;
    }

    /** 取得已購卡頁面的卡片資訊 (根據中獎金額>預中獎金額排序>原生排序) */
    public getPurchasedCardList() {
        const withIndex = this.ownedCards.map((card, index) => ({
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
        if(this.selectedCardContent == CARD_CONTENT.DIY){
            return (this.selectedDIYCards.length == 0) ? true : false;
        }else{
            return false;
        }
    }

    //#endregion

    //#region 參數設定

    /** 設定目前卡片購買類型 */
    public setCardState(state : CARD_STATUS){
        this.selectedCardType = state;
    }

    /** 設定目前卡片內容類型 */
    public setCardContent(state : CARD_CONTENT){
        this.selectedCardContent = state;
    }

    /** 設定目前要購買的玩法 */
    public setPlayState(state : CARD_GAMEPLAY) {
        this.selectedPlayMode = state;
        
        /** 設定預設籌碼編號 */
        if(this.selectedPlayMode == CARD_GAMEPLAY.COMDO)
            this.selectedChipIndex = 0;
        else if(this.selectedPlayMode == CARD_GAMEPLAY.EXTRA)
            this.selectedChipIndex = 1;
    }

    /** 變更當前籌碼 */
    public setCurChipIndex(index : number) {
        this.selectedChipIndex = index;
    }

    /** 變更購卡數量 */
    public ChangeReadyBuyValue(value : number) {
        this.cardsToBuy += value;
        this.cardsToBuy = Math.max(1, Math.min(this.getMaxCardCount(), this.getCardsToBuy()));
    }

    public setReadyBuy(value : number) {
        this.cardsToBuy = value;
        this.cardsToBuy = Math.max(1, Math.min(this.getMaxCardCount(), this.getCardsToBuy()));
    }

    /** 設定需要編輯的DIY卡片資訊 */
    public setDIYEditCard(data) {
        this.editableDIYCard = data;
    }

    /** 儲存主播頁面資訊 */
    public setAvatarData(data) {
        this.hostAvatarData = data;
    }
        
    //#endregion

    //#region 不同頁面的業務邏輯
     
    // 快照資料處理 test
    public setTestSnapshot(data) {
        this.nickname = data.nickName;
        this.coin = data.coin;
        this.currency = data.currency;
        this.gameState = data.gameState;
        this.bettingTime = data.buyTime;
        this.currentBallSequence = data.ballList;
        this.ownedCards = data.cardInfo;
        this.jackpotAmountDisplay = data.BingoJackpotAmount;
        this.online = data.online;
        this.ballHitCountMap = data.ballNumberWinMap;
    }

    /** 檢查展示購卡或是已購卡頁面 */
    public showCardPurchasePage() {     
        return (this.ownedCards.length == 0)
    }

    /** 取得下注頁面相關資訊 */
    public getCardPurchasePageData() {
        let data = {
            cardContent: this.selectedCardContent,                                  // 卡片內容
            playState : this.selectedPlayMode,                                 // 玩法類型
            curChipIndex : this.selectedChipIndex,                           // 目前玩家選擇的籌碼編號
            chipList : this.getChipList(),                              // 籌碼列表
            playCombo : (this.selectedPlayMode == CARD_GAMEPLAY.COMDO),        // 是COMDO玩法 
            playJackpot : (this.selectedPlayMode == CARD_GAMEPLAY.JACKPOT),    // 是BingoJackpot玩法
        }
        return data;
    }

    /** 取得確認頁面相關資訊 */
    public getConfirmPurchasePageData() {
        // 取得卡片售賣金額與玩法類型名稱
        let cardsPrice = this.getChipPrice();
        let gameTypeStr = "";
        if(this.selectedPlayMode == CARD_GAMEPLAY.COMDO) {
            gameTypeStr = "Comdo";
        }
        else if(this.selectedPlayMode == CARD_GAMEPLAY.EXTRA) {
            gameTypeStr = "extra";
        }
        else {
            gameTypeStr = "B$J";
        }
        // 是不是DIY類型的買卡
        let isDIYType = (this.selectedCardContent == CARD_CONTENT.DIY);
        // 設定購買卡片類型的文字
        let cardTypeStr = isDIYType ? "DIY cards" : "Random cards";

        let data = {
            isDIYType : (this.selectedCardContent == CARD_CONTENT.DIY),            // 是不是DIY類型的買卡
            cardTypeStr : cardTypeStr,                                  // 卡片類型文字
            gameTypeStr : gameTypeStr,                                  // 玩法類型文字
            cardsPriceStr : (this.currency + cardsPrice),                  // 卡片售價金額
            numberOfCardStr : ("X" + this.getCardsToBuy()),                       // 購買卡片數量
            totalAmountStr : (this.currency + this.getBuyTotalCard()),     // 卡片總金額
        }
        return data;
    }

    /** 取得下注籌碼金額 */
    public getChipPrice() {
        if(this.selectedPlayMode == CARD_GAMEPLAY.COMDO) {
            return this.comboChips[this.selectedChipIndex];
        }
        else if(this.selectedPlayMode == CARD_GAMEPLAY.EXTRA) {
            return this.extraChips[this.selectedChipIndex];
        }
        else {
            return this.jackpotChipCost;
        }
    }

    /** 取得已購卡頁面相關資訊 */
    public getPurchasedTicketPageData() {
        /** 計算總贏分與預中獎列表 */
        let totalWin = 0;
        let rewardMap: { [reward: number]: number[] } = {};  // 用金額分類球號
        let PreItems: { reward: number, numbers: number[] }[] = [];
        
        this.ownedCards.forEach((card) => {
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
            BottomBtnState = (this.ownedCards.length < 500) ? 0 : 3;
        }else {
            if(this.selectedCardType == CARD_STATUS.PREORDER) {
                if(this.ownedCards.length < 500)
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
            cardCount : this.ownedCards.length,
            betCoin : this.currentBetAmount,
        }
        return data;
    }

    //#endregion

    //#region 與Server交互訊息

    // 初始化快照資訊
    public init() {
        // 解析伺服器傳來的主要 ID 與狀態資訊
        const idData = window.serverData["id"];
        this.GameRoundID = idData.game_round_id;
        this.NextGameRound = idData.next_game_round;
        this.gameState = this.serverStateEvent[idData.game_event];
        this.currentBallSequence = idData.prize_number.split(',').map(Number);

        // 解析玩家基本資訊
        const info = window.serverData["info"];
        this.currency = "₱";
        this.coin = Number(info.balance ?? "0");
        this.nickname = info.nickname ?? "";

        // 解析獎池資訊
        const jackpot = window.serverData["jackpot"];
        this.jackpotAmountDisplay = jackpot.Jackpot ?? "0";
        this.bingoAmountDisplay = jackpot.Bingo ?? "0";

        // 解析獎金清單（前 10 為獎項，11、12 為 OneTG 與 TwoTG）
        const prizeListData = window.serverData["list"].list;
        for (let i = 0; i < 10; i++) {
            this.prizeList[i] = Number(prizeListData[i]?.bonus ?? 0);
        }
        this.OneTGAmountDisplay = prizeListData[10]?.bonus ?? "0";
        this.TwoTGAmountDisplay = prizeListData[11]?.bonus ?? "0";

        // 在線人數
        this.online = window.serverData["online"];

        // 解析卡片訂單清單，分類與處理投注金額
        const cardList = window.serverData["cardList"];
        const orders = this.classifyOrders(cardList.list);
        const totalAmount = this.processOrders(orders);
        this.currentBetAmount = totalAmount;

        // 通知系統快照初始化完成
        EventManager.getInstance().emit(GameStateEvent.GAME_SNAPSHOT);
    }

    /**
     * 將訂單依照 order_number 分組，並依照 play_code 分類為對應的玩法類型
     * @param orders 訂單清單
     * @returns 整理後的訂單陣列，每筆附上 items 與 cardplay 屬性
     */
    private classifyOrders(orders: any[]): any[] {
        const grouped: { [orderNumber: string]: any[] } = {};

        // 依 order_number 將訂單分組
        for (const order of orders) {
            const orderNumber = order.order_number;
            if (!grouped[orderNumber]) {
                grouped[orderNumber] = [];
            }
            grouped[orderNumber].push(order);
        }

        const result: any[] = [];

        // 分析每個訂單群組，決定卡片玩法類型
        for (const [orderNumber, items] of Object.entries(grouped)) {
            const playCodes = new Set(items.map(o => o.play_code));

            let type: CARD_GAMEPLAY;
            if (playCodes.size > 1) {
                type = CARD_GAMEPLAY.COMDO; 
            } else if (playCodes.has("100")) {
                type = CARD_GAMEPLAY.EXTRA;   
            } else {
                type = CARD_GAMEPLAY.JACKPOT;  
            }

            const firstItem = items[0];
            firstItem.items = items;              // 將整組訂單附加至第一項
            firstItem.cardplay = type;            // 標記玩法類型

            result.push(firstItem);
        }

        return result;
    }

    /**
     * 處理訂單資料，將每張卡片解析並建立對應的 CardMega 物件
     * @param orders 從伺服器取得的訂單列表
     * @returns 該批訂單的總投注金額
     */
    private processOrders(orders: any[]): number {
        let totalAmount = 0;

        orders.forEach((order) => {
            // 累加投注金額
            totalAmount += Number(order.amount);

            order.bet_content.forEach((card) => {
                // 處理號碼字串 -> 轉為數字陣列，無法轉換則為 null
                const rawNumbers = card.numbers.split(',').map(n => {
                    const num = Number(n);
                    return isNaN(num) ? null : num;
                });

                // 分離有效數字與 null，並對有效數字排序
                const numericPart = rawNumbers.filter(n => typeof n === 'number') as number[];
                const nullCount = rawNumbers.filter(n => n === null).length;
                numericPart.sort((a, b) => a - b);

                // 將 null 插入中間（維持原邏輯）
                const mid = Math.floor(numericPart.length / 2);
                const sortedNumbers = [
                    ...numericPart.slice(0, mid),
                    ...Array(nullCount).fill(null),
                    ...numericPart.slice(mid)
                ];

                // 加入號碼至號碼管理器（用於統一顯示等）
                CardNumberManager.getInstance().addCard(sortedNumbers);

                // 判斷卡片是否為 DIY 類型
                const cardContent = card.numbers.includes("DIY") ? 1 : 0;

                // 根據期號判斷卡片屬於本期還是下期
                let cardState: number | null = null;
                if (this.GameRoundID === order.issue_number) {
                    cardState = 0; // 本期
                } else if (this.NextGameRound === order.issue_number) {
                    cardState = 1; // 下期
                }
                if (cardState === null) return;

                // 建立卡片資料並實例化卡片
                const data = {
                    cardId: card.id,
                    cardState,
                    cardContent,
                    playState: order.cardplay,
                    numbers: sortedNumbers
                };
                const megaCard = new CardMega(data);
                this.ownedCards.push(megaCard);
            });
        });

        return totalAmount;
    }

    /** 取得目前擁有的卡片號碼 */
    public gethaveCardNumberList() {
        let number = [];
        this.ownedCards.forEach((item)=>{
            number.push(item.getCardInfo());
        })
        return number;
    }

    /** 發送確認購卡請求（亂數卡片 + DIY卡片統一處理） */
    public SendConfirmPurchase() {
        const isNormalCard = this.selectedCardContent === CARD_CONTENT.NORMAL;

        const data: any = {
            gameRoundID: this.NextGameRound,                // 當局 ID
            cardState: this.selectedCardType,               // 卡片類型
            cardContent: isNormalCard ? this.selectedCardContent : 1,  // 卡片內容（DIY 固定為 1）
            playState: this.selectedPlayMode,               // 玩法
            chipPries: this.getChipPrice(),                 // 籌碼金額
        };

        if (isNormalCard) {
            data.readyBuy = this.getCardsToBuy();           // 亂數卡片的購買數量
        } else {
            data.cardInfo = this.selectedDIYCards;          // DIY 卡片資訊
        }
        CardNumberManager.getInstance().createPurchaseCards(data);
    }

    /** 確認購卡回包(確認頁面) */
    public ConfirmPurchaseResponse(data) {
        this.confirmedPurchaseCards = [];
        // 獲取確認購卡頁面的卡片資訊
        for(let i = 0; i < data.length; i++){
            let cardInfo = data[i];
            let card = new CardMega(cardInfo);
            this.confirmedPurchaseCards.push(card);
        }
        // 購卡頁面按鈕恢復成可使用狀態
        this.isBuyButtonEnabled = true;
        // 開啟確認夠卡介面
        PopupManager.showPopup(PopupName.ConfirmPurchasePage);
    }

    /** 發送變更隨機卡片內容數據請求 (只限定非DIY卡片內容) */
    public SnedChangeCardData() {
        let data = [];
        for (let i = 0; i < this.confirmedPurchaseCards.length; i++) {
            let cardInfo = this.confirmedPurchaseCards[i];
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
        this.confirmedPurchaseCards.forEach((item) =>{
            let card = {
                "card_detail": item.getCardInfoString(),
                "card_id": item.getID(),
                "gameType": item.getPlayState(),
            }
            cards.push(card);
        });

        let play_code = null;
        switch(this.selectedPlayMode) {
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
        HttpServer.CardCreate_POST(cards, this.getChipPrice(), play_code)
        .then(results => {
            // 解析伺服器回傳的訂單資料
            const orders = this.classifyOrders(results.data);
            console.warn("成功 orders => ", orders);

            // 處理訂單內容並更新當前投注金額
            const totalAmount = this.processOrders(orders);
            this.currentBetAmount += totalAmount;
        });
    }

    /** 發送玩家確定購卡回包  */
    public SendPurchasedCardListResponse(data) {
        CardNumberManager.getInstance().clearConfirmedPurchaseCards();
        this.confirmedPurchaseCards = [];
        this.selectedDIYCards = [];          // 清除玩家選擇的DIY卡片
        this.cardsToBuy = 1;    
        this.selectedCardContent = 0;         

        // 檢查是否已存在相同 ID 的卡片
        data.forEach(newCard => {
            const exists = this.ownedCards.some(card => card.getID() === newCard.id);
            // 若不存在，加入列表
            if (!exists) {
                this.ownedCards.push(newCard);
            }
        });

        // 文字提示
        let ToastStr = (this.selectedCardContent === CARD_CONTENT.NORMAL) ? "随机卡片购买成功" : "DIY卡片购买成功";
        ToastManager.showToast(ToastStr);
        // 開啟已購卡介面
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage);
    }

    /** 發球事件 */
    public ServerToBallEvent(num) {
        if (this.currentBallSequence.includes(num)) {
            console.error("球號重複 Server資訊 Data => ", num);
            return;
        }

        this.ownedCards.forEach((cardItem, index)=>{
            cardItem.updateCard(num);
        })

        this.currentBall = num;
        this.currentBallSequence.push(num);
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
            cost : this.currentBetAmount, // 總下注金額
            extral : 1,                   // extral玩法贏分
            jackpot : 1,                  // Jackpot玩法贏分
            total : 0,                    // 總贏分
        }
        return data;
    }

    /** 遊戲結束重置所有參數 */
    public GameOver(buyTime? : number) {
        this.bettingTime = (buyTime) ? buyTime : 60;
        this.currentBall = null;
        this.currentBallSequence = [];
        CardNumberManager.getInstance().clearOwnedCards();
        // 檢查玩家當局是否買卡
        let HasTheCurrentPlayerPurchasedCard = (this.ownedCards.length > 0);

        // 將預購卡轉為本局卡，其他全部清除
        const nextRoundCards = this.ownedCards.filter(card => {
            if (card.getCardState() === CARD_STATUS.PREORDER) {
                card.setCardState(CARD_STATUS.NORMAL);
                CardNumberManager.getInstance().addCard(card.getCardInfo());
                return true;
            }
            return false;
        });

        this.ownedCards = nextRoundCards;
        if(this.ownedCards.length > 0){
            this.selectedCardType = CARD_STATUS.NORMAL;
        }
        else{
            // 玩家當局有買卡才做購卡頁面數據重置行為
            if(HasTheCurrentPlayerPurchasedCard){
                this.cardsToBuy = 1;
                this.selectedPlayMode = 0;
            }
        }
        EventManager.getInstance().emit(GameStateEvent.GAME_OVER);
    }

    /** DIY購卡頁面參數 */
    public getDIYCardSelectionData() {
        // 取得目前已經購買的 DIY 卡片
        const DIYCard = this.ownedCards.filter(card => {
            return (card.getCardContent() === CARD_CONTENT.DIY);
        });
        // 建立卡片資料並加上是否已選擇（給 UI 用），並把已購買的卡片排後面
        const listData = this.savedDIYCards
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
            DIYmaxCard: this.maxDIYCardCount,      // 同時收藏最多DIY卡片數量
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
            const diyIndex = this.savedDIYCards.findIndex(card => card.getID() === id);
            if (diyIndex !== -1) {
                this.savedDIYCards.splice(diyIndex, 1, newCard);
            }
        }else {
            let newCardData = {
                cardId: CardNumberManager.getInstance().generateCardID(),
                numbers: data,
            }
            let newCard = new CardMega(newCardData);
            this.savedDIYCards.push(newCard);
        }
    }

    /** DIY刪除 */
    public DIYDelete(data) {
        const diyIndex = this.savedDIYCards.findIndex(card => card.getID() === data.id);
        if (diyIndex !== -1) {
            this.savedDIYCards.splice(diyIndex, 1);
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
        this.selectedDIYCards = data;
    }

    /** 測試用 新增收藏DIY卡片 */
    public setDIYCardList(data) {
        this.savedDIYCards = data;
    }

    /** DIY購卡頁面參數 */
    public getDIYEditData() {
        let ballDisplayInfo = this.getBallDisplayInfo();
        let data = {
            ballDisplayInfo : ballDisplayInfo,    // 球號中獎資訊
            editCard: this.editableDIYCard,                     // 要編輯的卡片資訊
            hotBalls: this.hotBallList,                        // 熱卡
            coldBalls: this.hotBallList,                       // 冷卡
            normalBalls: this.normalBallList,                  // 正常卡
        }
        return data;
    }

    /** 測試用 新增收藏DIY卡片 */
    public setballNumberWinMap(data) {
        this.ballHitCountMap = data;
    }

    /** 取得球號中獎資訊 */
    protected getBallDisplayInfo(): any[] {
        const hotBalls: any[] = [];
        const coldBalls: any[] = [];
        const normalBalls: any[] = [];

        this.hotBallList = [];
        this.coldBallList = [];
        this.normalBallList = [];
    
        this.ballHitCountMap.forEach((num, index)=> {
            let ballNumber = index;
            if (num > 75) {
                this.hotBallList.push(ballNumber);
                hotBalls.push({ ballNumber, winCount: num, color: "red", ratio: 1 });
            } else if (num < 50) {
                this.coldBallList.push(ballNumber);
                coldBalls.push({ ballNumber, winCount: num, color: "blue", ratio: 1 });
            } else {
                this.normalBallList.push(ballNumber);
                normalBalls.push({ ballNumber, winCount: num, color: "gray", ratio: 1 });
            }
        })
    
        this.assignRatio(hotBalls);
        this.assignRatio(coldBalls);
        this.assignRatio(normalBalls);

        return [...hotBalls, ...coldBalls, ...normalBalls].sort((a, b) => a.ballNumber - b.ballNumber);
    }
    /** 球號資訊轉化為對應的進度條 */
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
        return this.hostAvatarData;
    }

    /** 取得總球數頁面資訊 */
    public getAllBallNumbersData() {
        let data = {
            ballList : this.currentBallSequence,
            // tableId : this.gameID,
        }
        return data;
    }

    /** Jackpot中獎金額資訊 */
    public getJackpotAndBingoWinData() {
        let data = {
            Jackpot: this.jackpotAmountDisplay,
            Bingo: this.bingoAmountDisplay,
            OneTG: this.OneTGAmountDisplay,
            TWOTG: this.TwoTGAmountDisplay,
        }
        return data;
    }

    /** 儲存排行本頁面資訊 */
    public setLeaderboardData(data) {
        this.currentJPRanking = data.JPRanking;
        this.historicalJPRanking = data.JPHistory;
        this.historicalEPRanking = data.EPHistory;
        this.currentEPRanking = data.EPRanking;
    }
    /** 排行榜資訊頁面 */
    public getLeaderboardData() {
        let data = {
            JPRanking : this.currentJPRanking,   // 當局Jackpot榜單
            JPHistory : this.historicalJPRanking,   // 歷史中獎Jackpot榜單
            EPRanking : this.currentEPRanking,   // 當局額外球榜單
            EPHistory : this.historicalEPRanking,   // 歷史中獎額外球榜單
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
        return {name : this.nickname, content : message};
    }

    /** 取得個人中心頁面資訊 */
    public getPersonalCenterPage() {
        let data = {
            nickName : this.nickname,
            id : "1151512323",
            coin : this.coin,
            
        }
        return data;
    }

    //#endregion
}
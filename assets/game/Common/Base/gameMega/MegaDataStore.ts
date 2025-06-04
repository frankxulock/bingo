import { CURRENCY_SYMBOL } from "../../Tools/Base/BaseDataManager";
import { CommonTool } from "../../Tools/CommonTool";
import { CardMegaTest } from "../card/CardMegaTest";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS } from "../CommonData";
import CardNumberManager from "./CardNumberManager";
/**
 * 賓果遊戲數據存儲類
 * 實現數據存儲接口，只負責數據的存儲和基本存取
 */
export class MegaDataStore {
    // 基礎屬性
    public nickname: string = "";
    public coin: number = 0;
    public currency: string = "";
    public user_id: string = "";

    // 遊戲狀態
    public gameState: GAME_STATUS = GAME_STATUS.LOADING;
    public bettingTime: number = 60;
    public GameRoundID: string = "";
    public NextGameRound: string = "";
    public online: number = 0;

    // 卡片和籌碼
    public selectedCardType: CARD_STATUS = CARD_STATUS.NORMAL;
    public selectedCardContent: CARD_CONTENT = CARD_CONTENT.NORMAL;
    public selectedPlayMode: CARD_GAMEPLAY = CARD_GAMEPLAY.COMDO;
    public currentBetAmount: number = 0;
    public comboChips: number[] = [10, 25, 55, 105, 205, 505];
    public extraChips: number[] = [5, 20, 50, 100, 200, 500];
    public jackpotChipCost: number = 5;
    public selectedChipIndex: number = 0;
    public multiples: number = 0;

    // 卡片數量
    public cardsToBuy: number = 0;
    public readonly maxCardCount: number = 500;
    public readonly maxDIYCardCount: number = 60;

    // 卡片集合
    public editableDIYCard: CardMegaTest | null = null;
    public savedDIYCards: CardMegaTest[] = [];
    public selectedDIYCards: CardMegaTest[] = [];
    public confirmedPurchaseCards: CardMegaTest[] = [];
    public ownedCards: CardMegaTest[] = [];

    // 球號相關
    public ballHitCountMap: Map<number, number> = new Map();
    public hotBallList: number[] = [];
    public coldBallList: number[] = [];
    public normalBallList: number[] = [];
    public currentBall: number | null = null;
    public currentBallSequence: number[] = [];
    public readonly totalBallCount: number = 49;

    // 獎金相關
    public awardedItems: any[] = [];
    public pendingAwardItems: any[] = [];
    public jackpotAmountDisplay: string = "";
    public bingoAmountDisplay: string = "";
    public OneTGAmountDisplay: string = "";
    public TwoTGAmountDisplay: string = "";
    public prizeList: any[] = [];

    // 排行榜
    public currentJPRanking: any = null;
    public historicalJPRanking: any = null;
    public currentEPRanking: any = null;
    public historicalEPRanking: any = null;

    // 其他
    public hostAvatarData: any = null;
    public videoUrls : string[] = [];
    /**
     * 從服務器數據初始化存儲
     */
    public initFromServer(serverData: any): void {
        // 解析伺服器傳來的主要 ID 與狀態資訊
        const idData = serverData["id"];
        if(idData) {
            this.GameRoundID = idData.game_round_id;
            this.NextGameRound = idData.next_game_round;
            this.gameState = this.getGameStateFromServer(idData.game_event);
            this.currentBallSequence = idData.prize_number ? idData.prize_number.split(',').map(Number) : [];
        }

        // 解析玩家基本資訊
        const info = serverData["info"];
        if(info) {
            this.coin = Number(info.balance ?? "0");
            this.nickname = info.nickname ?? "";
            this.user_id = info.merchant_user_id ?? "";
        }
        const currency = serverData["currency"];
        if(currency) {
            this.currency = CURRENCY_SYMBOL[currency.currency_type];
        }

        // 解析設定資訊
        const setting = serverData['setting']
        if(setting) {
            const settings: any = setting.list;
            const extraPattern = settings.find(item => item.category_id === 100);
            const jackpotPattern = settings.find(item => item.category_id === 101);
            if (extraPattern && jackpotPattern) {
                this.jackpotChipCost = Number(jackpotPattern.base_price);
                this.extraChips = extraPattern.multiple_setting
                    .split(',')
                    .map(str => Number(str.trim()))
                    .filter(n => !isNaN(n));
                this.comboChips = this.extraChips.map(extra => extra + this.jackpotChipCost);
            }
        }

        // 解析獎池資訊
        const jackpot = serverData["jackpot"];
        if(jackpot) {
            this.jackpotAmountDisplay = jackpot.Jackpot ?? "0";
            this.bingoAmountDisplay = jackpot.Bingo ?? "0";
        }

        // 解析獎金清單（前 10 為獎項，11、12 為 OneTG 與 TwoTG）
        const prizeListData = serverData["list"]?.list;
        if(prizeListData) {
            for (let i = 0; i < 10; i++) {
                this.prizeList[i] = Number(prizeListData[i]?.bonus ?? 0);
            }
            this.OneTGAmountDisplay = prizeListData[10]?.bonus ?? "0";
            this.TwoTGAmountDisplay = prizeListData[11]?.bonus ?? "0";
        }

        // 在線人數
        this.online = serverData["online"];

        // 解析Video視頻地址
        const video = serverData["video"];
        if(video) {
            this.videoUrls.push(video.flv_pull_front_view);
            this.videoUrls.push(video.flv_pull_ball_view);
        }

        // 解析卡片訂單清單，分類與處理投注金額
        const cardList = serverData["cardList"];
        if(cardList && cardList.list) {
            this.currentBetAmount = 0;
            const orders = this.classifyOrders(cardList.list);
            this.processOrders(orders);

            const extraPatternsItem = cardList.list.find(
                (item) => item.play_name === "BGM Extra Patterns"
            );
    
            if(extraPatternsItem) {
                this.selectedCardType = (this.GameRoundID == extraPatternsItem.issue_number) 
                    ? CARD_STATUS.NORMAL : CARD_STATUS.PREORDER;
                this.multiples = extraPatternsItem.multiples;
                this.selectedChipIndex = this.extraChips.findIndex(chip => chip === this.multiples);
                if (this.selectedChipIndex === -1) this.selectedChipIndex = 0;
            }

            this.currentBallSequence.forEach((ball)=> {
                this.ownedCards.forEach((card)=>{
                    card.updateCard(ball);
                })
            })
        }
    }

    /**
     * 從服務器獲取創建的卡片資訊
     */
    public createCardServer(data: any): void {
        // 解析伺服器回傳的訂單資料
        const orders = this.classifyOrders(data.data);
        // console.warn("成功 orders => ", orders);
        // 處理訂單內容
        this.processOrders(orders);

        const extraPatternsItem = data.data.find(
            (item) => item.play_name === "BGM Extra Patterns"
        );
    
        if(extraPatternsItem) {
            this.selectedCardType = (this.GameRoundID == extraPatternsItem.issue_number) 
                ? CARD_STATUS.NORMAL : CARD_STATUS.PREORDER;
            this.multiples = extraPatternsItem.multiples;
            this.selectedChipIndex = this.extraChips.findIndex(chip => chip === this.multiples);
            if (this.selectedChipIndex === -1) this.selectedChipIndex = 0;
        }
    }

    /**
     * 從服務器事件獲取遊戲狀態
     */
    private getGameStateFromServer(event: string): GAME_STATUS {
        switch (event) {
            case "begin":
                return GAME_STATUS.BUY;
            case "wait_prize":
                return GAME_STATUS.DRAWTHENUMBERS;
            case "prize_on_going":
                return GAME_STATUS.REWARD;
            default:
                return GAME_STATUS.LOADING;
        }
    }

    /**
     * 將訂單依照 order_number 分組，並依照 play_code 分類為對應的玩法類型
     * @param orders 訂單清單
     * @returns 整理後的訂單陣列，每筆附上 items 與 cardplay 屬性
     */
    private classifyOrders(orders: any[]): any[] {
        const grouped: { [orderNumber: string]: any[] } = {};
        let betAmount = 0;
        // 依 order_number 將訂單分組
        for (const order of orders) {
            // 累加投注金額
            betAmount += Number(order.amount);
            const orderNumber = order.order_number;
            if (!grouped[orderNumber]) {
                grouped[orderNumber] = [];
            }
            grouped[orderNumber].push(order);
        }
        this.currentBetAmount += betAmount;
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
     */
    private processOrders(orders: any[]): void {

        orders.forEach((order) => {
            order.bet_content.forEach((card) => {
                const sortedNumbers = CommonTool.TransformCardInfo(card.numbers);
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
                const megaCard = new CardMegaTest(data);
                this.ownedCards.push(megaCard);
            });
        });
    }

    /** 當前購買卡片數量 */
    public getCardsToBuy() {
        if(this.selectedCardContent == CARD_CONTENT.NORMAL)
            return this.cardsToBuy;
        else 
            return this.selectedDIYCards.length;
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

    /** 取得要給Server的倍數 */
    public getMultiples() {
        if(this.selectedPlayMode == CARD_GAMEPLAY.EXTRA)
            return this.extraChips[this.selectedChipIndex]
        else if(this.selectedPlayMode == CARD_GAMEPLAY.COMDO)
            return this.comboChips[this.selectedChipIndex];
        else if(this.selectedPlayMode == CARD_GAMEPLAY.JACKPOT)
            return this.jackpotChipCost;
        return null;
    }
} 
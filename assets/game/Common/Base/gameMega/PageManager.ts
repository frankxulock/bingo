import { CommonTool } from "../../Tools/CommonTool";
import { CARD_GAMEPLAY, CARD_STATUS, GAME_STATUS, CARD_CONTENT } from "../CommonData";
import { MegaDataStore } from "./MegaDataStore";

export default class PageManager {
    
    constructor(private dataStore: MegaDataStore) {
    }

    /** 取得下注頁面相關資訊 */
    public showCardPurchasePage() {
        return (this.dataStore.ownedCards.length == 0)
    }

    /** 取得下注頁面相關資訊 */
    public getCardPurchasePageData() {
        let data = {
            cardContent: this.dataStore.selectedCardContent,                                  // 卡片內容
            playState : this.dataStore.selectedPlayMode,                                 // 玩法類型
            curChipIndex : this.dataStore.selectedChipIndex,                           // 目前玩家選擇的籌碼編號
            chipList : this.dataStore.getChipList(),                              // 籌碼列表
            playCombo : (this.dataStore.selectedPlayMode == CARD_GAMEPLAY.COMDO),        // 是COMDO玩法 
            playJackpot : (this.dataStore.selectedPlayMode == CARD_GAMEPLAY.JACKPOT),    // 是BingoJackpot玩法
            multiples : this.dataStore.multiples,
        }
        return data;
    }

    /** 取得確認頁面相關資訊 */
    public getConfirmPurchasePageData() {
        // 取得卡片售賣金額與玩法類型名稱
        let cardsPrice = this.dataStore.getChipPrice();
        let gameTypeStr = "";
        if(this.dataStore.selectedPlayMode == CARD_GAMEPLAY.COMDO) {
            gameTypeStr = "Comdo";
        }
        else if(this.dataStore.selectedPlayMode == CARD_GAMEPLAY.EXTRA) {
            gameTypeStr = "extra";
        }
        else {
            gameTypeStr = "B$J";
        }
        // 是不是DIY類型的買卡
        let isDIYType = (this.dataStore.selectedCardContent == CARD_CONTENT.DIY);
        // 設定購買卡片類型的文字
        let cardTypeStr = isDIYType ? "DIY cards" : "Random cards";

        let data = {
            isDIYType : (this.dataStore.selectedCardContent == CARD_CONTENT.DIY),            // 是不是DIY類型的買卡
            cardTypeStr : cardTypeStr,                                  // 卡片類型文字
            gameTypeStr : gameTypeStr,                                  // 玩法類型文字
            cardsPriceStr : (this.dataStore.currency + cardsPrice),                  // 卡片售價金額
            numberOfCardStr : ("X" + this.dataStore.getCardsToBuy()),                       // 購買卡片數量
            totalAmountStr : (this.dataStore.currency + CommonTool.formatNumber(this.dataStore.getBuyTotalCard())),     // 卡片總金額
        }
        return data;
    }

    /** 取得已購卡頁面相關資訊 */
    public getPurchasedTicketPageData() {
        /** 計算總贏分與預中獎列表 */
        let totalWin = 0;
        let rewardMap: { [reward: number]: number[] } = {};  // 用金額分類球號
        let PreItems: { reward: number, numbers: number[] }[] = [];
        
        this.dataStore.ownedCards.forEach((card) => {
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
        if(this.dataStore.gameState == GAME_STATUS.BUY || this.dataStore.gameState == GAME_STATUS.GAMEOVER) {
            BottomBtnState = (this.dataStore.ownedCards.length < 500) ? 0 : 3;
        }else {
            if(this.dataStore.selectedCardType == CARD_STATUS.PREORDER) {
                if(this.dataStore.ownedCards.length < 500)
                    BottomBtnState = 1;
            }else {
                if(totalWin > 0)
                    BottomBtnState = 2;
            }
        }

        // 取得已購卡頁面的卡片資訊 (根據中獎金額>預中獎金額排序>原生排序)
        const cardData = this.dataStore.ownedCards.map((card, index) => ({
            card,
            index,
            totalWin: card.getTotalWin(),
            preWin: card.getPreTotalWin(),
        }));
        cardData.sort((a, b) => {
            if (b.totalWin !== a.totalWin) {
                return b.totalWin - a.totalWin; // 中獎金額高的排前面
            }
            if (b.preWin !== a.preWin) {
                return b.preWin - a.preWin;     // 預中獎金額高的排前面
            }
            return a.index - b.index;           // 保留原本順序
        });


        let d = {
            pendingWinnerItem: PreItems,                    // 即將中獎內容列表
            BottomBtnState: BottomBtnState,                 // 下方顯示列表
            totalWin : totalWin,                            // 總贏分
            cardData: (cardData.map(entry => entry.card)),
        }

        return d;
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
            cost : this.dataStore.currentBetAmount, // 總下注金額
            extral : 1,                   // extral玩法贏分
            jackpot : 1,                  // Jackpot玩法贏分
            total : 0,                    // 總贏分
        }
        return data;
    }

    /** 取得用戶資訊 */
    public getUserPageData() {
        let data = {
            currency:  this.dataStore.currency,
            amount : CommonTool.formatNumber(this.dataStore.coin),
            cardCount : this.dataStore.ownedCards.length,
            betCoin : CommonTool.formatNumber(this.dataStore.currentBetAmount),
        }
        return data;
    }

    /** 取得個人中心頁面 */
    public getPersonalCenterPageData() {
        let data = {
            nickName: this.dataStore.nickname,
            id: "123",
            coin: this.dataStore.coin,
        }
        return data;
    }

    /** DIY購卡頁面參數 */
    public getDIYEditPageData() {
        let ballDisplayInfo = this.getBallDisplayInfo();
        let data = {
            ballDisplayInfo : ballDisplayInfo,    // 球號中獎資訊
            editCard: this.dataStore.editableDIYCard,                     // 要編輯的卡片資訊
            hotBalls: this.dataStore.hotBallList,                        // 熱卡
            coldBalls: this.dataStore.hotBallList,                       // 冷卡
            normalBalls: this.dataStore.normalBallList,                  // 正常卡
        }
        return data;
    }

    /** 取得球號中獎資訊 */
    protected getBallDisplayInfo(): any[] {
        const hotBalls: any[] = [];
        const coldBalls: any[] = [];
        const normalBalls: any[] = [];

        this.dataStore.hotBallList = [];
        this.dataStore.coldBallList = [];
        this.dataStore.normalBallList = [];
    
        this.dataStore.ballHitCountMap.forEach((num, index)=> {
            let ballNumber = index;
            if (num > 75) {
                this.dataStore.hotBallList.push(ballNumber);
                hotBalls.push({ ballNumber, winCount: num, color: "red", ratio: 1 });
            } else if (num < 50) {
                this.dataStore.coldBallList.push(ballNumber);
                coldBalls.push({ ballNumber, winCount: num, color: "blue", ratio: 1 });
            } else {
                this.dataStore.normalBallList.push(ballNumber);
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

    /** 歷史紀錄頁面 */
    public getGameRecordPageData() {
        let data = {

        }
        return data;
    }

    /** 取得主播頁面資訊 */
    public getAvatarPageData() {
        return this.dataStore.hostAvatarData;
    }

    /** 取得總球數頁面資訊 */
    public getAllBallNumbersPageData() {
        let data = {
            ballList : this.dataStore.currentBallSequence,
            tableId : this.dataStore.GameRoundID,
        }
        return data;
    }

    /** DIY購卡頁面參數 */
    public getDIYCardSelectionPageData() {
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

    /** 排行榜資訊頁面 */
    public getLeaderboardPageData() {
        let data = {
            JPRanking : this.dataStore.currentJPRanking,   // 當局Jackpot榜單
            JPHistory : this.dataStore.historicalJPRanking,   // 歷史中獎Jackpot榜單
            EPRanking : this.dataStore.currentEPRanking,   // 當局額外球榜單
            EPHistory : this.dataStore.historicalEPRanking,   // 歷史中獎額外球榜單
        }
        return data;
    }

    /** 請求目前有的聊天記錄 */
    public getChatPageData() {
        let data = [
            {name : "Caler", content : "test"},
            {name : "Caler1", content : "test1"},
            {name : "Caler2", content : "test2"},
            {name : "Caler3", content : "test3"},
        ];
        return data;
    }
}               
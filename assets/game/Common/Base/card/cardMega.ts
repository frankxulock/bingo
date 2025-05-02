import { CARD_GAMEPLAY, CARD_STATUS } from "../CommonData";
import BaseCardData from "./BaseCardData";

/** 基礎遊戲卡片資料 */
export class CardMega extends BaseCardData {

    protected bingoSpot: number = 0b0000000000001000000000000;  // 默認中獎卡片位置 由上至下左至右排序
    private cardState : CARD_STATUS;                    // 卡片類型
    private playState : CARD_GAMEPLAY;                  // 玩法類型
    private validityRange = {                      // 檢查範圍
        [CARD_GAMEPLAY.COMDO] : 4,
        [CARD_GAMEPLAY.EXTRA] : 4,
        [CARD_GAMEPLAY.JACKPOT] : 24,
    }

    /** Bingo＆Jackpot玩法特定參數 */
    private jackpotBall : number = 44;          // Jackpot 獎勵球數
    private bingoBall : number = 49;            // Bingo 獎勵球數
    private jackpotWin : boolean = false;       // Jackpot中獎
    private bingoWin : boolean = false;         // Bingo中獎 
    private oneTG : boolean = false;            // 剩餘1顆球
    private twoTG : boolean = false;            // 剩餘2顆球  

    /** ExtraPatterns玩法特定參數 */
    private rewardLine : number[] = [];         // 中獎線段
    private preData = [];                       // 預中獎位置與中獎金額
    // 中獎線類型
    protected extraline = [
        // 基礎中獎
        0b1000001000001000001000001,  // 中獎線右斜線中獎圖
        0b0000100010001000100010000,  // 中獎線左斜線中獎圖
        0b1000100000001000000010001,  // 中獎線四角點中獎圖
        // 2L線段
        0b1111111111001000000000000,
        0b0000011111111110000000000,
        0b0000000000111111111100000,
        0b0000000000001001111111111,
        0b1111100000111110000000000,
        0b0000011111001001111100000,
        0b0000000000111110000011111,
        0b1111100000001001111100000,
        0b0000011111001000000011111,
        0b1111100000001000000011111,
        // T型線段
        0b1000010000111110000100001,
        // X型線段
        0b1000101010001000101010001,
        // 3L線段
        0b1111111111111110000000000,
        0b0000011111111111111100000,
        0b0000000000111111111111111,
        0b1111111111001001111100000,
        0b1111111111001000000011111,
        0b1111100000111111111100000,
        0b1111100000001001111111111,
        0b0000011111111110000011111,
        0b0000011111001001111111111,
        0b1111100000111110000011111,
        // 3K線段
        0b1111110001101011000111111,
        // 4L線段
        0b1111111111111111111100000,
        0b1111111111111110000011111,
        0b1111111111000001111111111,
        0b1111100000111111111111111,
        0b0000011111111111111111111,
        // 花型
        0b1111111011101011101111111,
    ]
    private extralPrice = [20,40,108,228,600,3000,6000,78000];  // 獎金金額
    public uncheckedBG: cc.SpriteFrame;
    public checkedBG: cc.SpriteFrame;

    // 卡片初始化
    constructor (data) {
        super();
        this.id = data.cardId;
        this.cardState = data.cardState;
        this.playState = data.playState;
        this.cardInfo = data.numbers;
    }

    // 更新卡片數據
    protected updateCard(ball: number): void {
        // 預購卡不做更新
        if(this.cardState == CARD_STATUS.PREORDER)
            return;
        super.updateCard(ball);
    }

    /** 根據遊戲類型檢查中獎圖型 */
    protected bingoPatternCheck(){
        // 有中獎圖型可能才開始檢查
        if(this.sendBall >= this.validityRange[this.cardState]) {
            // 根據玩法類型進行對應檢查
            switch(this.playState){
                case CARD_GAMEPLAY.COMDO:
                    this.checkBingoAndJackpot();
                    this.checkExtraPatterns();
                    break;
                case CARD_GAMEPLAY.JACKPOT:
                    this.checkBingoAndJackpot();
                    break;
                case CARD_GAMEPLAY.EXTRA:
                    this.checkExtraPatterns();
                    break;
            }
        }
    }

    //#region Jackpot和Bingo玩法的功能

    // 檢查Bingo和Jackpot中獎狀態
    checkBingoAndJackpot() {
        // 如果已經中獎就不再計算
        if(this.checkBingoOrJackpotStatus())
            return;

        let count = this.countWinningBalls(this.bingoSpot);
        let allcard = this.cardInfo.length - 1;

        // 檢查剩餘幾球
        this.oneTG = false;
        this.twoTG = false;
        let unclaimedBalls = allcard - count;
        if(unclaimedBalls == 1){
            this.oneTG = true;
        }else if(unclaimedBalls == 2){
            this.twoTG = true;
        }

        // 卡片是否全部中獎
        if(count == allcard){
            // 檢查Jackpot中獎
            if(this.sendBall <= this.jackpotBall){
                this.jackpotWin = true;
            // 檢查Bingo中獎
            }else if(this.sendBall <= this.bingoBall){
                this.bingoWin = true;
            }
            return;
        }
    }

    // 檢查是否已經中大獎
    checkBingoOrJackpotStatus(){
        return (this.jackpotWin || this.bingoWin);
    }
    
    // 計算中獎球的數量
    countWinningBalls(bingoSpot: number): number {
        let count = 0;
        while (bingoSpot !== 0) {
            // 將 bingoSpot 與 1 進行與運算，檢查最右邊的位是否為 1
            count += bingoSpot & 1; 
            // 右移一位，檢查下一個位
            bingoSpot >>= 1;
        }
        return count;
    }
    //#endregion

    //#region 額外玩法的判斷事件

    /** 檢查額外玩法的中獎狀態 */
    private checkExtraPatterns() {
        this.showClaimedRewards();
        this.showFilteredPreRewardsForUnhitNumbers();
    }

    /** 已經中獎線段 */
    private showClaimedRewards() {
        this.rewardLine = this.extraline.reduce((acc, pattern, index) => {
            if ((this.bingoSpot & pattern) === pattern) {
                acc.push(index); // 完全中獎
            }
            return acc;
        }, []);
        // 包含關係檢查
        this.rewardLine = this.filterIncludedPatterns(this.rewardLine);
    }

    /** 每個未中號碼補中後的預中獎金額（排除被包含圖型） */
    private showFilteredPreRewardsForUnhitNumbers() {
        this.preData = [];

        for (let i = 0; i < this.cardInfo.length; i++) {
            const bit = 1 << i;
            if ((this.bingoSpot & bit) !== 0) continue; // 跳過已中獎位置

            const matchedPatternIndexes = this.findMatchedPatternsForUnhitNumber(i);
            const totalReward = this.calculateTotalReward(matchedPatternIndexes);

            if (totalReward > 0) {
                const data = { id: i, reward: totalReward };
                this.preData.push(data);
                console.log(`未中位置 [${data.id}] 補中後有效預中獎金額：${data.reward}`);
            }
        }
    }

    /** 查找與指定未中號碼匹配的圖型索引 */
    private findMatchedPatternsForUnhitNumber(idx: number): number[] {
        return this.extraline.reduce((acc, pattern, j) => {
            const diff = this.bingoSpot ^ pattern;
            if (this.countSetBits(diff) === 1 && (diff & (1 << idx))) {
                acc.push(j);
            }
            return acc;
        }, []);
    }

    /** 過濾被包含的圖型（移除被包含的） */
    private filterIncludedPatterns(indices: number[]): number[] {
        return indices.filter((i) => {
            const patternI = this.extraline[i];
            return !indices.some((j) => {
                if (i === j) return false; // 自己不過濾
                const patternJ = this.extraline[j];
                return (patternJ & patternI) === patternI; // 如果 patternI 被 patternJ 包含
            });
        });
    }

    /** 計算預中獎金額 */
    private calculateTotalReward(matchedPatternIndexes: number[]): number {
        return matchedPatternIndexes.reduce((total, idx) => total + this.getRewardPrie(idx), 0);
    }

    /** 獲取金額 */
    private getRewardPrie(idx: number): number {
        if (idx === 0 || idx === 1) {
            return this.extralPrice[0];  // 斜線
        } else if (idx === 2) {
            return this.extralPrice[1];  // 四角
        } else if (idx >= 3 && idx <= 12) {
            return this.extralPrice[2];  // 2L 線段
        } else if (idx === 13 || idx === 14) {
            return this.extralPrice[3];  // T / X 型
        } else if (idx >= 15 && idx <= 24) {
            return this.extralPrice[4];  // 3L 線段
        } else if (idx === 25) {
            return this.extralPrice[5];  // 3K 線段
        } else if (idx >= 26 && idx <= 30) {
            return this.extralPrice[6];  // 4L 線段
        } else if (idx === 31) {
            return this.extralPrice[7];  // 花型
        }
        return 0;
    }

    /** 計算二進制中1的個數（即差異位的數量） */
    private countSetBits(number: number): number {
        let count = 0;
        while (number) {
            count += (number & 1);
            number >>= 1;
        }
        return count;
    }

    //#endregion

    getCardViewData() {
        let title;
        if(this.cardState == CARD_STATUS.NORMAL)
            title = "BUY";
        else if(this.cardState == CARD_STATUS.PREORDER)
            title = "PRE-BUY";
        else if(this.cardState == CARD_STATUS.DIY)
            title = "DIY";
        let haveBingoJackpo = (this.playState == CARD_GAMEPLAY.EXTRA) ? false : true;
        let haveExtra = (this.playState == CARD_GAMEPLAY.JACKPOT) ? false : true;

        let data = {
            title: title,
            DIYCard: (this.cardState === CARD_STATUS.DIY),
            haveBingoJackpo: haveBingoJackpo,
            haveExtra: haveExtra,
            numbers: this.cardInfo,
            checkedBG: this.checkedBG,
        }
        return data;
    }

    getChageCardData() {
        return {
            id: this.id,
            numbers: this.cardInfo,
            cardState: this.cardState,
            playState: this.playState,
        }
    }
}
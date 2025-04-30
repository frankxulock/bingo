import BaseCardData from "./BaseCardData";

/** 基礎遊戲卡片資料 */
export class CardMega extends BaseCardData {

    protected bingoSpot: number = 0b000000000000000;  // 默認中獎卡片位置 由上至下左至右排序
    protected price : number = 1;                     // 默認金額
    protected buyMultiplier : number = 1;             // 購買倍數
    private validityRange = 5;                        // 檢查範圍
    private rewardLine : number[] = [];         // 中獎線段
    private preData = [];                       // 預中獎位置與中獎金額
    // 中獎線類型
    protected extraline = [
        0b001010100010001,  // 三角型
        0b100100100100100,  // 1L_0
        0b010010010010010,  // 1L_1
        0b001001001001001,  // 1L_2
        0b111000000000111,  // 兩側型
        0b001011101011001,  // 三角+底線
        0b110010011010110,  // 牛角
        0b101010101010101,  // 格子
        0b110110110110110,  // 2L_0
        0b011011011011011,  // 2L_1
        0b101101101101101,  // 2L_2
        0b100111100111100,  // 桌子
        0b100111101111100,  // 桌子+底線
        0b111010111010111,  // 倒王
        0b111101101101111,  // 一圈
        0b111111111111111,  // 全部
    ]
    private extralPrice = [3,8,10,40,100,200,350,720,1800];  // 獎金金額

    // 卡片初始化
    constructor (data) {
        super();
    }

    // 更新卡片數據
    protected updateCard(ball: number): void {
        super.updateCard(ball);
    }

    /** 根據遊戲類型檢查中獎圖型 */
    protected bingoPatternCheck(){
        // 有中獎圖型可能才開始檢查
        if(this.sendBall >= this.validityRange) {
            this.checkExtraPatterns();
        }
    }

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
        if (idx >= 0 && idx <= 3) {
            return this.extralPrice[0];
        }else if (idx === 4) {
            return this.extralPrice[1];
        }else if (idx === 5) {
            return this.extralPrice[2];
        }else if (idx >= 6 && idx <= 7) {
            return this.extralPrice[3];
        }else if (idx >= 8 && idx <= 11) {
            return this.extralPrice[4];
        }else if (idx === 12) {
            return this.extralPrice[5];
        }else if (idx === 13) {
            return this.extralPrice[6];
        }else if (idx === 14) {
            return this.extralPrice[7];
        }else if (idx === 15) {
            return this.extralPrice[8];
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
}
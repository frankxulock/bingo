/** 基礎遊戲卡片資料 */
export default abstract class BaseCardData {
    protected id : number = null;                        // 卡片ID
    protected price : number = null;                     // 默認金額
    protected cardInfo : number[] = [];                  // 卡片數據
    protected bingoSpot : number = null;                 // 中獎位置（使用二進制）
    protected totalWin : number = 0;                     // 中獎金額
    protected preTotalWin : number;                      // 預中獎金額
    protected sendBall : number = 0;                     // 已經發送球數
    protected extraline = [];                            // 中獎線類型

    /** 更新卡片數據 */
    public updateCard(ball : number){
        // 紀錄已經發送球數
        this.sendBall++;
        // 根據 ball 的數字找到對應位置並設置 bingoSpot 的對應二進制位
        const index = this.cardInfo.indexOf(ball); // 找到 ball 在 cardInfo 中的索引
        if (index !== -1) {
            // 使用位運算將對應的二進制位置設置為 1
            this.bingoSpot |= (1 << index); // 將 index 對應的位設為 1
        }
        // console.log(this.bingoSpot.toString(2).padStart(25, '0')); // 顯示二進制格式，並填充到 25 位
        //檢查中獎圖型
        this.bingoPatternCheck();
    }

    protected bingoPatternCheck(){};
    public getCardViewData(){ return null };
    public getChageCardData() { return null};
    public getTotalWin() { return this.totalWin; }
    public getPreTotalWin() { return this.preTotalWin; }

    public setCardState(state : number) { }
    public getCardState() {return null; }
    public getCardContent() { return null; }

    public getPreData() {return null;}
    public getCardInfo() { return this.cardInfo; }

    public getID() {
        return this.id;
    }
}
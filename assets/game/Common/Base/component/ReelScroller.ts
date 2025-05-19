const { ccclass, property } = cc._decorator;

@ccclass
export default class ReelScroller extends cc.Component {
    @property(cc.Node)
    private scrollNode: cc.Node = null; // 包含三個 Label 的父節點，用於滾動動畫的位移控制

    @property([cc.Label])
    private Label_txt: cc.Label[] = []; // 三個 Label，依序代表 上(0)、中(1)、下(2)

    private rollHeight: number = 24;      // 每次滾動一格的高度，與 Label 高度對應
    private rollDuration: number = 1;     // 整個滾動動畫的持續時間（秒）
    private rollCount: number = 2;        // 滾動圈數，代表要完整滾動幾圈

    private targetDigit: number = 0;      // 目標數字，滾動結束後中間 Label 要顯示的數字

    /**
     * 取得目前目標數字
     */
    public getTargetDigit(): number {
        return this.targetDigit;
    }

    /**
     * 傳入 0~9 的整數，滾動動畫結束後中間 Label 顯示該目標數字
     * @param targetDigit 目標數字，範圍 0 ~ 9
     */
    public setAmount(targetDigit: number): void {
        // 驗證目標數字是否在合法範圍
        if (!Number.isInteger(targetDigit) || targetDigit < 0 || targetDigit > 9) {
            cc.error('ReelScroller.setAmount: 請輸入 0~9 的整數');
            return;
        }

        this.targetDigit = targetDigit;

        // 初始化三個 Label 文字為空，避免殘留
        this.Label_txt[0].string = "";
        this.Label_txt[1].string = "";
        this.Label_txt[2].string = "";

        // 從數字 0 開始滾動
        let currentNum = Number(this.Label_txt[0].string) ?? 0;
        // 總步數 = 完整滾動圈數 * 10 (數字個數) + 目標數字
        const totalSteps = this.rollCount * 10 + targetDigit;
        let step = 0;

        // 先停止舊動畫，避免衝突
        cc.Tween.stopAllByTarget(this.scrollNode);
        this.scrollNode.y = 0;

        // 遞迴函式執行每一步滾動動畫
        const doRoll = (): void => {
            if (step >= totalSteps) {
                // 動畫結束，顯示目標數字並重置位置
                this.Label_txt[0].string = ((this.targetDigit + 9) % 10).toString();  // 上方數字是目標數字前一個數字
                this.Label_txt[1].string = this.targetDigit.toString();               // 中間為目標數字
                this.Label_txt[2].string = ((this.targetDigit + 1) % 10).toString();  // 下方為目標數字下一個數字

                this.scrollNode.y = 0;
                return;
            }

            // 設定三個 Label 的文字，模擬滾動數字
            this.Label_txt[0].string = currentNum.toString();                  // 上方數字為目前數字
            const nextDigit = (currentNum + 1) % 10;
            this.Label_txt[1].string = nextDigit.toString();                   // 中間為下一個數字（滾動目標）
            this.Label_txt[2].string = (nextDigit + 1) % 10 + "";              // 下方為再下一個數字

            currentNum = nextDigit;

            // 重設 scrollNode 的 y 軸位置，為下一次滾動做準備
            this.scrollNode.y = 0;

            // 執行往下滾動的動畫，動畫時間除以總步數，讓動畫均分在每一步
            cc.tween(this.scrollNode)
                .to(this.rollDuration / totalSteps, { y: -this.rollHeight }, { easing: 'linear' }) // 線性動畫更自然
                .call(() => {
                    // 動畫結束，重置 scrollNode 位置，進入下一步
                    this.scrollNode.y = 0;
                    step++;
                    doRoll();
                })
                .start();
        };

        doRoll();
    }
}

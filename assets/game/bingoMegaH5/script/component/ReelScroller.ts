const { ccclass, property } = cc._decorator;

@ccclass
export default class ReelScroller extends cc.Component {
    @property(cc.Node)
    private scrollNode: cc.Node = null; // 父節點，包住三個 Label

    @property([cc.Label])
    private Label_txt: cc.Label[] = []; // 依序為 上、中、下

    private rollHeight: number = 24; // 每次滾動一格的高度（Label 高度）
    private rollDuration: number = 1; // 滾動動畫時間
    private rollCount: number = 2; // 滾幾圈

    public targetDigit: number;

    /**
     * 傳入 0~9，滾動效果結束後中間 Label 為目標數字
     */
    public setAmount(targetDigit: number) {
        if (targetDigit < 0 || targetDigit > 9) {
            cc.error('setAmount: 請輸入 0~9 的整數');
            return;
        }

        this.targetDigit = targetDigit;

        // 初始化 Label 文字
        this.Label_txt[0].string = ""; // 上
        this.Label_txt[1].string = ""; // 中
        this.Label_txt[2].string = ""; // 下

        let currentNum = 0;
        let totalSteps = this.rollCount * 10 + targetDigit;
        let step = 0;

        const doRoll = () => {
            if (step >= totalSteps) {
                this.Label_txt[1].string = targetDigit.toString(); // 中 Label 顯示最終數字
                this.scrollNode.y = 0; // 重置位置
                return;
            }

            // 設定三個 Label 的數字
            const nextDigit = (currentNum + 1) % 10;
            this.Label_txt[0].string = currentNum.toString();       // 上
            this.Label_txt[1].string = nextDigit.toString();        // 中
            this.Label_txt[2].string = (nextDigit + 1) % 10 + "";   // 下

            currentNum = nextDigit;

            cc.Tween.stopAllByTarget(this.scrollNode);
            // 執行滾動動畫：Y 軸往下 scrollHeight 像素
            this.scrollNode.y = 0;
            cc.tween(this.scrollNode)
                .to(this.rollDuration / totalSteps, { y: -this.rollHeight })
                .call(() => {
                    this.scrollNode.y = 0; // 重置位置
                    step++;
                    doRoll();
                })
                .start();
        };

        doRoll();
    }
}

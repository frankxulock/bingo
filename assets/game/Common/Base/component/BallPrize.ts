import { CommonTool } from "../../../Common/Tools/CommonTool";
import BallCompoent from "./BallCompoent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BallPrize extends cc.Component {

    /** 獎項球號項目列表 */
    @property({ type: [BallCompoent], visible: true })
    private BallPrizeItems: BallCompoent[] = [];

    /** 顯示獎金金額的 Label */
    @property({ type: cc.Label, visible: true })
    private Label_amount: cc.Label = null;

    /**
     * 設定獎項球號與金額資料
     * @param data 包含 numbers 與 reward 的獎項資料
     */
    public setData(data: { numbers: number[]; reward: number }): void {
        // 設定每個球號的顯示與動作
        this.BallPrizeItems.forEach((item, index) => {
            const number = data.numbers[index];
            if (number !== undefined && number !== null) {
                item.setAction(true);
                item.setBallNumber(number);
            } else {
                item.setAction(false);
            }
        });

        // 設定金額顯示，使用格式化工具轉換
        const formattedMoney = CommonTool.formatMoney2(data.reward, "+");
        CommonTool.setLabel(this.Label_amount, formattedMoney);
    }
}

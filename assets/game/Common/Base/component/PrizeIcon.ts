import { CommonTool } from "../../../common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

/**
 * PrizeIcon 元件
 * 用於顯示獎勵金額，並格式化數字顯示
 */
@ccclass
export default class PrizeIcon extends cc.Component {
    /** 
     * 顯示金額的 Label 元件，編輯器可見並可綁定
     */
    @property(cc.Label)
    private Label_coin: cc.Label = null;

    /**
     * 設置並格式化顯示的金額
     * @param coin - 金額數字
     */
    public setCoin(coin: number): void {
        // 使用 CommonTool 來格式化金額並更新 Label 文字
        CommonTool.setLabel(this.Label_coin, CommonTool.formatMoney(coin));
    }
}

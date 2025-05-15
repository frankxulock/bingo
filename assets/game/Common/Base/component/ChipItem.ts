import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChipItem extends cc.Component {

    /** 未選取狀態下顯示的籌碼金額 Label */
    @property(cc.Label)
    private unselected_Label: cc.Label = null;

    /** 選取狀態下顯示的籌碼金額 Label */
    @property(cc.Label)
    private selected_Label: cc.Label = null;

    /**
     * 設定籌碼的數字顯示
     * @param num 要顯示的籌碼金額
     */
    public setChipAmount(num: number) {
        CommonTool.setLabel(this.unselected_Label, num);
        CommonTool.setLabel(this.selected_Label, num);
    }
}

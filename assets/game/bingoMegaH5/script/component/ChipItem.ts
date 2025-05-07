import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChipItem extends MegaComponent {

    private unselected_Label : cc.Label = null;
    private selected_Label : cc.Label = null;

    protected init(): void {
        super.init();
        this.unselected_Label = this.node.children[0].children[0].getComponent(cc.Label);
        this.selected_Label = this.node.children[1].children[0].getComponent(cc.Label);
    }

    /** 設定籌碼金額 */
    setChipAmount(num : number) {
        CommonTool.setLabel(this.unselected_Label, num);
        CommonTool.setLabel(this.selected_Label, num);
    }
}

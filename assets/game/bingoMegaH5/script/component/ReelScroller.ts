import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelScroller extends MegaComponent {
    private curLabel : cc.Label;

    protected init(): void {
        super.init();
        this.curLabel =  this.node.children[0].getComponent(cc.Label);
    }

    public setAmount(num : string) {
        CommonTool.setLabel(this.curLabel, num);
    }
}

import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PrizeIcon extends MegaComponent {

    private Label_coin : cc.Label;
    
    protected init(): void {
        super.init();
        this.Label_coin = this.node.children[0].getComponent(cc.Label);
    }

    setCoin(coin : number) {
        CommonTool.setLabel(this.Label_coin, CommonTool.formatMoney(coin));
    }
}

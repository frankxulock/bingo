import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PrizeIcon extends MegaComponent {
    @property({ type: cc.Label, visible: true })
    private Label_coin : cc.Label = null;
    
    protected init(): void {
        super.init();
    }

    setCoin(coin : number) {
        CommonTool.setLabel(this.Label_coin, CommonTool.formatMoney(coin));
    }
}

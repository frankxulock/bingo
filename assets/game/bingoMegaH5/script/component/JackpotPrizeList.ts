import MegaDataManager from "../../../Common/Base/gameMega/MegaDataManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class JackpotPrizeList extends cc.Component {

    @property({ type: cc.Label, visible: true })
    private Label_JP_Amount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_EP_Amount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_1TG_Amount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_2TG_Amount: cc.Label = null;
    
    protected start(): void {
        let data = MegaDataManager.getInstance().getJackpotAndBingoWinData();
        CommonTool.setLabel(this.Label_JP_Amount, data.Jackpot);
        CommonTool.setLabel(this.Label_EP_Amount, data.Bingo);
        CommonTool.setLabel(this.Label_1TG_Amount, data.OneTG);
        CommonTool.setLabel(this.Label_2TG_Amount, data.TWOTG);
    }
}

import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import BallCompoent from "./BallCompoent";

const { ccclass, property } = cc._decorator;

@ccclass("BallPrize")
export default class BallPrize extends MegaComponent {

    @property({ type: [BallCompoent], visible: true })
    private BallPrizeItems: BallCompoent[] = [];
    @property({ type: cc.Label, visible: true })
    private Label_amount: cc.Label = null;

    public setData(data) {
        /** 設定球號 */
        this.BallPrizeItems.forEach((item, index)=> {
            let number = data.numbers[index]
            if(data.numbers[index]){
                item.setAction(true);
                item.setBallNumber(number);
            }else{
                item.setAction(false);
            }
        });
        let money = CommonTool.formatMoney2(data.reward, "+");
        CommonTool.setLabel(this.Label_amount, money);
    }
}

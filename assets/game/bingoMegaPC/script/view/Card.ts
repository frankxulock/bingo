import BaseCardData from "../../../Common/Base/card/BaseCardData";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
    @property({ type: cc.Label, visible: true })
    private Label_titel: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_BingoJackpot: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_E: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;
    private IconSp : cc.Sprite[] = null;
    private Label_nums : cc.Label[] = [];

    setData(cardData : BaseCardData) 
    {
        // 設定卡片顯示內容
        let data = cardData.getCardViewData();
        CommonTool.setLabel(this.Label_titel, data.title);
        this.Node_BingoJackpot.active = data.haveBingoJackpo;
        this.Node_E.active = data.haveExtra;
        if(this.IconSp == null){
            this.IconSp = this.Node_NumberGroup.getComponentsInChildren(cc.Sprite);
            this.IconSp.forEach((i)=> {
                this.Label_nums.push(i.node.children[0].getComponent(cc.Label));
            })
        }

        this.Label_nums.forEach((i, index)=>{
            let numbers = data.numbers[index];
            CommonTool.setLabel(i, numbers);
            // 檢查中間卡片應該顯示的名稱
            if(numbers == null){
                let txt = (data.DIYCard) ? "DIY" : "Free";
                CommonTool.setLabel(i, txt);
            }
        })
    }
}
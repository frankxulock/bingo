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
    @property({ type: cc.Node, visible: true })
    private Node_WinLineGroup: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_WinGroup: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_WinAmount: cc.Label = null;

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

        this.IconSp.forEach((i, index)=> {
            let numberItemBG = data.numberItemBGs[index];
            CommonTool.setSprite(i, numberItemBG);
        })

        this.Label_nums.forEach((i, index)=>{
            let numbers = data.numbers[index];
            CommonTool.setLabel(i, numbers);
            // 檢查中間卡片應該顯示的名稱
            if(numbers == null){
                let txt = (data.DIYCard) ? "DIY" : "Free";
                CommonTool.setLabel(i, txt);
            }
        })

        /** 檢查是否顯示中獎線 */
        if (this.Node_WinLineGroup && data.rewardLine) {
            this.Node_WinLineGroup.children.forEach((item, index) => {
                item.active = data.rewardLine.includes(index);
            });
        }

        /** 顯示此卡的總贏分 */
        if (this.Node_WinGroup) {
            const hasWin = data.totalWin && data.totalWin > 0;
            this.Node_WinGroup.active = hasWin;
            if (hasWin) {
                CommonTool.setLabel(this.Label_WinAmount, CommonTool.formatMoney2(data.totalWin));
            }
        }
    }
}
import { CardBG } from "../../../../Common/Base/card/CardMega";
import { CommonTool } from "../../../../Common/Tools/CommonTool";
import BingoMegaUI from "../../BingoMegaUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardIcon extends cc.Component {
    // 卡片圖示的 Sprite 組件
    @property({ type: cc.Sprite, visible: true })
    private Sprite_CardIcon: cc.Sprite = null;

    // 顯示數字的 Label 組件
    @property({ type: cc.Label, visible: true })
    private Label_Number: cc.Label = null;

    /**
     * 設定卡片圖示的圖片
     * @param num 要設定的 SpriteFrame 圖片
     */
    public setSprite(num: number) {
        let IconBG = BingoMegaUI.getInstance().getAllCardIconBG();
        let colorTxt = BingoMegaUI.getInstance().getAllCardText();
        CommonTool.setSprite(this.Sprite_CardIcon, IconBG[num]);
        this.Label_Number.node.color = colorTxt[num];
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(txt: string) {
        CommonTool.setLabel(this.Label_Number, txt);
    }
}

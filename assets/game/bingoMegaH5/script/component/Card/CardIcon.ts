import { CommonTool } from "../../../../Common/Tools/CommonTool";

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
     * @param spr 要設定的 SpriteFrame 圖片
     */
    public setSprite(spr: cc.SpriteFrame) {
        CommonTool.setSprite(this.Sprite_CardIcon, spr);
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(txt: string) {
        CommonTool.setLabel(this.Label_Number, txt);
    }
}

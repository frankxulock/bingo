import { CommonTool } from "../../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardIcon extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    private Sprite_CardIcon: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    private Label_Number: cc.Label = null;

    /** 設定圖片 */
    public setSprite(spr : cc.SpriteFrame){
        CommonTool.setSprite(this.Sprite_CardIcon, spr);
    }

    /** 設定文字 */
    public setLabel(txt : string){
        CommonTool.setLabel(this.Label_Number, txt);
    }
}

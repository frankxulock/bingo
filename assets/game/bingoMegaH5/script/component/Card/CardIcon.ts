import { CommonTool } from "../../../../Common/Tools/CommonTool";
import BingoMegaUI from "../../BingoMegaUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardIcon extends cc.Component {
    // 卡片圖示的 Sprite 組件
    @property({ type: cc.Sprite, visible: true })
    private Sprite_CardIcon: cc.Sprite = null;

    /**
     * 設定卡片圖示的圖片
     * @param num 要設定的 SpriteFrame 圖片
     */
    public setSprite(num: number) {
        let IconBG = BingoMegaUI.getInstance().getAllCardIconBG();
        CommonTool.setSprite(this.Sprite_CardIcon, IconBG[num]);
    }
}

import { CommonTool } from "../../../Common/Tools/CommonTool";
import BingoMegaUI from "../BingoMegaUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BallComponent extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    private spriteBG: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    private ballNum: cc.Label = null;

    /** 設定是否可見 */
    setAction(visible: boolean): void {
        this.node.active = visible;
    }

    /** 球的大小 */
    getSize(): number {
        return this.node.getContentSize().width;
    }

    /** 取得位置 */
    getPosition(): cc.Vec2 {
        return this.node.getPosition();
    }

    /** 設定位置 */
    setPosition(pos: cc.Vec2): void {
        this.node.setPosition(pos);
    }

    /** 設定球號 */
    setBallNumber(ballNum: number): void {
        CommonTool.setLabel(this.ballNum, ballNum);
        const spriteFrame = this.getBallBG(ballNum);
        if (spriteFrame) {
            CommonTool.setSprite(this.spriteBG, spriteFrame);
        }
    }

    /** 取得球號對應的背景圖 */
    private getBallBG(ballNum: number): cc.SpriteFrame | null {
        if (ballNum < 1 || ballNum > 75) return null;

        const index = Math.floor((ballNum - 1) / 15);
        return BingoMegaUI.getInstance().getBallBG(index);
    }
}

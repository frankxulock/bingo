import BingoMegaUI from "../../../bingoMegaH5/script/BingoMegaUI";
import { CommonTool } from "../../../common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

/**
 * BallComponent
 * 獲換、顯示並設定 Bingo 球的結構元件
 */
@ccclass
export default class BallComponent extends cc.Component {
    /** 球背景圖片 */
    @property({ type: cc.Sprite, visible: true })
    private spriteBG: cc.Sprite = null;

    /** 球號給的 label */
    @property({ type: cc.Label, visible: true })
    private ballNum: cc.Label = null;

    /**
     * 設定是否顯示
     * @param visible true: 顯示, false: 隱藏
     */
    setAction(visible: boolean): void {
        this.node.active = visible;
    }

    /**
     * 獲取球容器寬度 (size)
     * @returns 球寬度
     */
    getSize(): number {
        return this.node.getContentSize().width;
    }

    /**
     * 獲取球位置
     * @returns 球位置 cc.Vec2
     */
    getPosition(): cc.Vec2 {
        return this.node.getPosition();
    }

    /**
     * 設定球位置
     * @param pos cc.Vec2 新位置
     */
    setPosition(pos: cc.Vec2): void {
        this.node.setPosition(pos);
    }

    /**
     * 設定球號字和背景
     * @param ballNum 球號 (1-75)
     */
    setBallNumber(ballNum: number): void {
        CommonTool.setLabel(this.ballNum, ballNum);
        const spriteFrame = this.getBallBG(ballNum);
        if (spriteFrame) {
            CommonTool.setSprite(this.spriteBG, spriteFrame);
        }
    }

    /**
     * 根據球號取得相應的背景圖
     * @param ballNum 球號 (1-75)
     * @returns cc.SpriteFrame | null
     */
    private getBallBG(ballNum: number): cc.SpriteFrame | null {
        if (ballNum < 1 || ballNum > 75) return null;

        const index = Math.floor((ballNum - 1) / 15); // 1~15:0, 16~30:1, ..., 61~75:4
        return BingoMegaUI.getInstance().getBallBG(index);
    }
}

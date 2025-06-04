import { GAME_STATUS } from "../../../Common/Base/CommonData";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Countdown extends MegaComponent {

    @property({ type: cc.Label, visible: true })
    private labelRemainingTime: cc.Label = null;  // 顯示剩餘時間的 Label
    private timer : number = 0;

    /** 註冊事件監聽器，當遊戲進入購買階段時開始倒計時 */
    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StaticUpdate_Countdown, this.UpdateTiming, this);
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
    }

    /** 移除事件監聽器，避免內存洩漏 */
    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StaticUpdate_Countdown, this.UpdateTiming, this);
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
    }

    /** 遊戲快照事件，恢復時如果遊戲狀態是購買階段則繼續倒計時 */
    protected onSnapshot(): void {
        const buyTime = this.data.GameStateBUY();
        this.node.active = (buyTime) ? true : false;
    }

    /** 更新倒數計時 */
    protected UpdateTiming(time) {
        this.node.active = true;
        const formattedTime = this.formatTime(time);
        CommonTool.setLabel(this.labelRemainingTime, formattedTime);
    }

    /** 將秒數轉換為 M:SS 格式（例如 90 -> 1:30） */
    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const paddedS = s < 10 ? `0${s}` : s;
        return `${m}:${paddedS}`;
    }
}

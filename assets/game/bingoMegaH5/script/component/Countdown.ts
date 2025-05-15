import { GAME_STATUS } from "../../../Common/Base/CommonData";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateEvent } from "../../../Common/Tools/Base/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Countdown extends MegaComponent {

    @property({ type: cc.Label, visible: true })
    private labelRemainingTime: cc.Label = null;  // 顯示剩餘時間的 Label

    private timer: number = 0;  // 倒計時秒數

    /**
     * 註冊事件監聽器，當遊戲進入購買階段時開始倒計時
     */
    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.startTiming, this);
    }

    /**
     * 移除事件監聽器，避免內存洩漏
     */
    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.startTiming, this);
    }

    /**
     * 遊戲快照事件，恢復時如果遊戲狀態是購買階段則繼續倒計時
     */
    protected onSnapshot(): void {
        const gameState = this.data.getGameState();
        if (gameState === GAME_STATUS.BUY) {
            this.startTiming();
        }
    }

    /**
     * 開始倒計時
     */
    private startTiming = (): void => {
        if (!this.labelRemainingTime) {
            cc.warn("labelRemainingTime 尚未綁定！");
            return;
        }
        this.node.active = true;
        this.timer = this.data.getBettingTime();

        // 先更新一次時間顯示
        this.updateTimerDisplay();

        // 每秒呼叫一次更新時間顯示
        this.schedule(this.updateTimerDisplay, 1);
    }

    /**
     * 更新倒計時顯示
     */
    private updateTimerDisplay = (): void => {
        if (this.timer <= 0) {
            this.unschedule(this.updateTimerDisplay);
            this.node.active = false;
            // 倒數結束，這裡可擴充倒計時結束後的邏輯
            return;
        }

        // 計算分鐘與秒數
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;

        // 格式化時間字串為 mm:ss
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // 更新 Label 顯示
        CommonTool.setLabel(this.labelRemainingTime, timeStr);

        // 倒數秒數減 1
        this.timer--;
    }
}

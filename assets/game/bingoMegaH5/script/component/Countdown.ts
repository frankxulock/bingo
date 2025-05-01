import { GAME_STATUS } from "../../../Common/Base/CommonData";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateEvent } from "../../../Common/Tools/EventManager/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Countdown extends MegaComponent {

    @property({ type: cc.Label, visible: true })
    private Label_RemainingTime : cc.Label;
    private timer : number = 0;

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.StartTiming, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.StartTiming, this);
    }

    /** 快照事件 */
    protected onSnapshot(): void {
        let gameState = this.data.getGameState();
        let buyTime = (gameState == GAME_STATUS.BUY);
        this.node.active = buyTime;
        if(buyTime) {
            this.StartTiming();
        }
    }

    /** 開始倒計時 */
    private StartTiming() {
        this.timer = this.data.getBuyTime();
        // 立即顯示一次初始時間
        this.updateTimerDisplay();
        // 每秒呼叫 updateTimerDisplay
        this.schedule(this.updateTimerDisplay, 1);
    }

    /** 更新顯示時間 */
    private updateTimerDisplay = () => {
        if (this.timer <= 0) {
            this.unschedule(this.updateTimerDisplay);
            this.node.active = false;
            // console.log("倒數結束");
            return;
        }

        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // 顯示時間
        CommonTool.setLabel(this.Label_RemainingTime, timeStr);

        this.timer--;
    }
}

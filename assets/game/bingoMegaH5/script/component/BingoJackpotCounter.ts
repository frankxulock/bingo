import ReelScroller from "../../../Common/Base/component/ReelScroller";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BingoJackpotCounter extends MegaComponent {
    /** 獎池數字顯示的節點群組 */
    @property({ type: cc.Node, visible: true })
    private Group_JackpotAmount: cc.Node = null;

    /** 每位數字對應的 Reels */
    private Reels: ReelScroller[] = [];

    /** 註冊事件監聽 */
    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_BingoJackpot, this.setBingoJackpotAmount, this);
    }

    /** 移除事件監聽 */
    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_BingoJackpot, this.setBingoJackpotAmount, this);
    }

    /** 初始化元件 */
    protected init(): void {
        super.init();
        this.Reels = this.Group_JackpotAmount.getComponentsInChildren(ReelScroller);
    }

    /** 快照更新時觸發，用來重設獎池金額 */
    protected onSnapshot(): void {
        this.setBingoJackpotAmount();
    }

    /** 設定獎池金額（右對齊顯示） */
    protected setBingoJackpotAmount(): void {
        // 取得並過濾金額字串，只保留數字
        const rawAmount = this.data.getBingoJackpotAmount();
        const amount = rawAmount.replace(/\D/g, "");

        // 從右往左對齊數字至對應的 Reel 上
        let amountIndex = amount.length - 1;
        for (let i = this.Reels.length - 1; i >= 0; i--) {
            if (amountIndex >= 0) {
                const digit = parseInt(amount.charAt(amountIndex), 10);
                if (this.Reels[i].getTargetDigit() !== digit) {
                    this.Reels[i].setAmount(digit);
                }
                amountIndex--;
            } else {
                // 數字長度不足時補 0
                this.Reels[i].setAmount(0);
            }
        }
    }
}
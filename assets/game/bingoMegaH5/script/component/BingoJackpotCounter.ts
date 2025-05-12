import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import ReelScroller from "./ReelScroller";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BingoJackpotCounter extends MegaComponent {
    @property({ type: cc.Node, visible: true })
    private Group_JackpotAmount : cc.Node = null;
    private Reels : ReelScroller[] = [];

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_BingoJackpot, this.setBingoJackpotAmount, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_BingoJackpot, this.setBingoJackpotAmount, this);
    }

    protected init(): void {
        super.init();
        this.Reels = this.Group_JackpotAmount.getComponentsInChildren(ReelScroller);
    }

    /** 設定獎池金額 */
    protected onSnapshot(): void {
        this.setBingoJackpotAmount();
    }

    /** 設定獎池金額（右對齊）*/
    setBingoJackpotAmount() {
        let rawAmount = this.data.getBingoJackpotAmount();
        let amount = rawAmount.replace(/\D/g, ''); // 過濾非數字（移除小數點、逗號等）
        
        let amountIndex = amount.length - 1;
        for (let i = this.Reels.length - 1; i >= 0; i--) {
            if (amountIndex >= 0) {
                let char = amount.charAt(amountIndex);
                let digit = parseInt(char, 10);
                if(this.Reels[i].targetDigit != digit)
                    this.Reels[i].setAmount(digit);
                amountIndex--;
            } else {
                // 數字不夠就補 0
                this.Reels[i].setAmount(0);
            }
        }
    }
}

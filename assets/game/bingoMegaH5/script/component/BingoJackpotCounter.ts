// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/EventManager/EventManager";
import ReelScroller from "./ReelScroller";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BingoJackpotCounter extends MegaComponent {
    @property({ type: cc.Node, visible: true })
    private Group_JackpotAmount : cc.Node;
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
        let amount = this.data.getBingoJackpotAmount();
        let amountIndex = amount.length - 1;
        for (let i = this.Reels.length - 1; i >= 0; i--) {
            if (amountIndex >= 0) {
                let char = amount.charAt(amountIndex);
                this.Reels[i].setAmount(char);
                amountIndex--;
            } else {
                // 補 0 或空白（視設計需求）
                this.Reels[i].setAmount("0");
            }
        }
    }
}

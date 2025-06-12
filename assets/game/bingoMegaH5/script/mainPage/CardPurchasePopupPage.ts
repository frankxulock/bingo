import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import CardPurchasePage from "./CardPurchasePage";
import EventManager, { GameStateEvent } from "../../../Common/Tools/Base/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardPurchasePopupPage extends CardPurchasePage implements IWindow {

    open(data: any): void {
        if(this.data == null) {
            this.init();
        }
        this.setPageState();
    }
    close(): void {
        PopupManager.closePopup(PopupName.CardPurchasePopupPage);
    }

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.ChangeGameType, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.ChangeGameType, this);
    }

    /** 快照恢復 */
    protected onSnapshot(): void {
        this.setPageState();
        if(!this.data.ActualNumberofCardsPurchased()){
            this.close();
        }
    }

    /** 開啟確認買卡片頁面 */
    protected OpenConfirmPurchasePage(): boolean {
        const shouldProceed = super.OpenConfirmPurchasePage();
        if (shouldProceed) {
            this.close();
        }
        return shouldProceed;
    }

    private ChangeGameType() {
        // 進入開球階段如果已經購買卡片強制關閉選卡介面
        if(!this.data.ActualNumberofCardsPurchased()) {
            this.close();
        }
    }
}

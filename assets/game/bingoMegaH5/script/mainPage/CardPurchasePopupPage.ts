import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";
import CardPurchasePage from "./CardPurchasePage";

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

    /** 快照恢復 */
    protected onSnapshot(): void {
        this.setPageState();
        if(!this.data.showCardPurchasePage()){
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
}

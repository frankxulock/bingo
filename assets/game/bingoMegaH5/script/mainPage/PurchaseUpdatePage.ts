import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PurchaseUpdatePage extends cc.Component implements IWindow {

    open(data?: any): void {
        // throw new Error("Method not implemented.");
    }
    close?(): void {
        PopupManager.closePopup(PopupName.PurchaseUpdatePage);
    }

    // 取消按鈕
    OnCancel() {
        this.close();
        PopupManager.closePopup(PopupName.ConfirmPurchasePage);
    }
    // 確認按鈕
    OnConfiem() {
        this.close();
    }
}

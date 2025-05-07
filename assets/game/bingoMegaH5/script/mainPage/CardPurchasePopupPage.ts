import { IWindow } from "../../../Common/Tools/PopupManager/IWindow";
import PopupManager, { PopupName } from "../../../Common/Tools/PopupManager/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardPurchasePopupPage extends cc.Component implements IWindow {
    // @property({ type: cc.Label, visible: true })
    // private Label_title: cc.Label = null;
    // @property({ type: cc.Label, visible: true })
    // private Label_win: cc.Label = null;

    open(data: any): void {
        let d = data;

        // CommonTool.setLabel(this.Label_title, d.title);
        // CommonTool.setLabel(this.Label_win, d.win);
    }
    close(...args: any[]): void {
        PopupManager.instance.closePopup(PopupName.CardPurchasePopupPage);
    }
}

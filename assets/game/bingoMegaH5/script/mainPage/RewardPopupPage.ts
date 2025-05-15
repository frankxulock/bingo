import { CommonTool } from "../../../common/Tools/CommonTool";
import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardPopupPage extends cc.Component implements IWindow {

    @property({ type: cc.Label, visible: true })
    private Label_win: cc.Label = null;
    private autoCloseTimer: number = null; // 用來記錄 setTimeout 的 ID

    open(data: any): void {
        let d = data;
        CommonTool.setLabel(this.Label_win, CommonTool.formatMoney2(d.win, "+ "));

        // 清除之前的定時器（如果存在）
        if (this.autoCloseTimer !== null) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }

        // 設定新的定時器：3 秒後關閉
        this.autoCloseTimer = setTimeout(() => {
            this.close();
        }, 3000);
    }

    close(): void {
        // 清除尚未執行的定時器（若從外部提早關閉）
        if (this.autoCloseTimer !== null) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }

        PopupManager.closePopup(PopupName.RewardPopupPage);
    }
}

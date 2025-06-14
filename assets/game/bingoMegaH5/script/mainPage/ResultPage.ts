import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultPage extends cc.Component implements IWindow {

    @property({ type: cc.Label, visible: true })
    private Label_total: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_extralWin: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_jackpotWin: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_const: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_extraItem: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_jackpotItem: cc.Node = null;
    private autoCloseTimer: number = null; // 用來記錄 setTimeout 的 ID

    open(data: any): void {
        let d = data;
        let extralWin = d.extral || 0;
        let jackpotWin = d.jackpot || 0;
        let total = extralWin + jackpotWin;
        this.Node_extraItem.active = (extralWin !== 0);
        this.Node_jackpotItem.active = (jackpotWin !== 0);

        CommonTool.setLabel(this.Label_total, CommonTool.formatNumber(total));
        CommonTool.setLabel(this.Label_extralWin, CommonTool.formatNumber(extralWin));
        CommonTool.setLabel(this.Label_jackpotWin, CommonTool.formatNumber(jackpotWin));
        CommonTool.setLabel(this.Label_const, d.const);

        // 清除之前的定時器（如果存在）
        if (this.autoCloseTimer !== null) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }

        // 設定新的定時器：5 秒後關閉
        this.autoCloseTimer = setTimeout(() => {
            this.close();
        }, 5000);
    }
    close(): void {
        PopupManager.closePopup(PopupName.ResultPage);
    }
}


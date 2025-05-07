import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupManager/IWindow";
import PopupManager, { PopupName } from "../../../Common/Tools/PopupManager/PopupManager";

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
    private Label_cost: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_extraItem: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_jackpotItem: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_close: cc.Node = null;

    open(data: any): void {
        let d = data;
        let extralWin = d.extral;
        let jackpotWin = d.jackpot;
        this.Node_extraItem.active = (extralWin !== 0);
        this.Node_jackpotItem.active = (jackpotWin !== 0);

        CommonTool.setLabel(this.Label_total, d.total);
        CommonTool.setLabel(this.Label_extralWin, extralWin);
        CommonTool.setLabel(this.Label_jackpotWin, jackpotWin);
        CommonTool.setLabel(this.Label_cost, d.cost);
    }
    close(...args: any[]): void {
        PopupManager.instance.closePopup(PopupName.ResultPage);
    }
}

